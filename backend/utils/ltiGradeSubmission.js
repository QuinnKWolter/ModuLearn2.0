const crypto = require('crypto');
const axios = require('axios');
const xmlBuilder = require('xmlbuilder');

// Submit grade to Canvas using LTI 1.1
const submitGradeLti1 = async (progressRecord, sourcedId, oauthConsumerKey, oauthConsumerSecret) => {
  try {
    // Calculate score (normalize to 0-1 range)
    const score = (progressRecord.score / progressRecord.maxScore) || 0;
    
    // XML for the submission
    const xml = xmlBuilder.create('imsx_POXEnvelopeRequest', {
      version: '1.0',
      encoding: 'UTF-8'
    })
      .att('xmlns', 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0')
      .ele('imsx_POXHeader')
        .ele('imsx_POXRequestHeaderInfo')
          .ele('imsx_version', 'V1.0').up()
          .ele('imsx_messageIdentifier', crypto.randomUUID()).up()
        .up()
      .up()
      .ele('imsx_POXBody')
        .ele('replaceResultRequest')
          .ele('resultRecord')
            .ele('sourcedGUID')
              .ele('sourcedId', sourcedId).up()
            .up()
            .ele('result')
              .ele('resultScore')
                .ele('language', 'en').up()
                .ele('textString', score.toFixed(2)).up()
              .up()
            .up()
          .up()
        .up()
      .up()
      .end({ pretty: true });
    
    // Generate OAuth 1.0a signature
    const url = 'https://canvas.instructure.com/api/lti/v1/tools/replace_grades';
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: oauthConsumerKey,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };
    
    // Create signature base string
    const paramString = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');
    
    const signatureBaseString = [
      'POST',
      encodeURIComponent(url),
      encodeURIComponent(paramString)
    ].join('&');
    
    // Generate signature
    const signatureKey = `${encodeURIComponent(oauthConsumerSecret)}&`;
    const signature = crypto
      .createHmac('sha1', signatureKey)
      .update(signatureBaseString)
      .digest('base64');
    
    // Add signature to OAuth parameters
    oauthParams.oauth_signature = signature;
    
    // Create Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
    
    // Send the request to Canvas
    const response = await axios.post(url, xml, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/xml'
      }
    });
    
    return {
      success: response.status === 200,
      data: response.data
    };
  } catch (error) {
    console.error('LTI 1.1 grade submission error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Submit grade to Canvas using LTI 1.3
const submitGradeLti13 = async (progressRecord, lineItemUrl, accessToken) => {
  try {
    // Calculate score (normalize to 0-1 range)
    const score = (progressRecord.score / progressRecord.maxScore) || 0;
    
    // Prepare score data according to LTI AGS specification
    const scoreData = {
      scoreGiven: progressRecord.score,
      scoreMaximum: progressRecord.maxScore,
      activityProgress: progressRecord.completionPercentage >= 100 ? 'Completed' : 'InProgress',
      gradingProgress: 'FullyGraded',
      userId: progressRecord.ltiUserId,
      timestamp: new Date().toISOString()
    };
    
    // Send the request to Canvas
    const response = await axios.post(`${lineItemUrl}/scores`, scoreData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.ims.lis.v2.score+json'
      }
    });
    
    return {
      success: response.status === 200 || response.status === 201,
      data: response.data
    };
  } catch (error) {
    console.error('LTI 1.3 grade submission error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generic function to submit grade to any LTI version
const submitGrade = async (progressRecord, ltiVersion, options) => {
  if (ltiVersion === '1.1') {
    const { sourcedId, oauthConsumerKey, oauthConsumerSecret } = options;
    return submitGradeLti1(progressRecord, sourcedId, oauthConsumerKey, oauthConsumerSecret);
  } else if (ltiVersion === '1.3') {
    const { lineItemUrl, accessToken } = options;
    return submitGradeLti13(progressRecord, lineItemUrl, accessToken);
  } else {
    return {
      success: false,
      error: `Unsupported LTI version: ${ltiVersion}`
    };
  }
};

module.exports = {
  submitGradeLti1,
  submitGradeLti13,
  submitGrade
}; 