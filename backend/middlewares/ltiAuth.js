const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// LTI 1.1 authentication middleware
const authenticateLti1 = (req, res, next) => {
  try {
    const {
      oauth_consumer_key,
      oauth_signature_method,
      oauth_timestamp,
      oauth_nonce,
      oauth_version,
      oauth_signature,
      ...otherParams
    } = req.body;

    // Validate required OAuth parameters
    if (!oauth_consumer_key || !oauth_signature_method || !oauth_timestamp || 
        !oauth_nonce || !oauth_signature) {
      return res.status(400).json({ message: 'Missing required OAuth parameters' });
    }

    // Check if consumer key exists in our database
    // const consumer = await LtiConsumer.findOne({ key: oauth_consumer_key });
    // if (!consumer) {
    //   return res.status(401).json({ message: 'Unknown consumer key' });
    // }

    // For demo purposes using a mock consumer secret
    const consumerSecret = 'test_consumer_secret';

    // Get request method and full URL
    const method = req.method.toUpperCase();
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // Create base string
    const params = { 
      ...otherParams,
      oauth_consumer_key,
      oauth_signature_method,
      oauth_timestamp,
      oauth_nonce,
      oauth_version: oauth_version || '1.0'
    };

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

    // Create parameter string
    const paramString = Object.entries(sortedParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    // Create signature base string
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

    // Generate signature
    const signatureKey = `${encodeURIComponent(consumerSecret)}&`;
    const calculatedSignature = crypto
      .createHmac('sha1', signatureKey)
      .update(baseString)
      .digest('base64');

    // Verify signature
    if (calculatedSignature !== oauth_signature) {
      return res.status(401).json({ message: 'Invalid OAuth signature' });
    }

    // Extract LTI data from request
    const ltiData = {
      userId: req.body.user_id,
      courseId: req.body.context_id,
      roles: req.body.roles?.split(',') || [],
      toolConsumerInstanceGuid: req.body.tool_consumer_instance_guid,
      customParams: Object.entries(req.body)
        .filter(([key]) => key.startsWith('custom_'))
        .reduce((acc, [key, value]) => {
          const cleanKey = key.replace('custom_', '');
          acc[cleanKey] = value;
          return acc;
        }, {})
    };

    // Attach LTI data to request
    req.ltiData = ltiData;

    next();
  } catch (error) {
    console.error('LTI 1.1 authentication error:', error);
    res.status(500).json({ message: 'LTI authentication error' });
  }
};

// LTI 1.3 authentication middleware
const authenticateLti13 = (req, res, next) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: 'Missing ID token' });
    }

    // In a real implementation, you would:
    // 1. Get the platform's JWKS (JSON Web Key Set)
    // 2. Find the key that matches the token's "kid" (Key ID)
    // 3. Verify the JWT signature using that key
    // 4. Validate claims like issuer, audience, etc.

    // For demo purposes, using a simplified approach:
    // const decoded = jwt.verify(
    //   id_token, 
    //   'public_key_or_secret',
    //   { algorithms: ['RS256'] }
    // );

    // Mock decoded token for demonstration
    const decoded = {
      "iss": "https://canvas.instructure.com",
      "sub": "12345",
      "aud": "client_id",
      "exp": Math.floor(Date.now() / 1000) + 3600,
      "iat": Math.floor(Date.now() / 1000),
      "nonce": "nonce_value",
      "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest",
      "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "deployment_id",
      "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": "https://your-app.com/lti",
      "https://purl.imsglobal.org/spec/lti/claim/roles": [
        "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"
      ],
      "https://purl.imsglobal.org/spec/lti/claim/context": {
        "id": "course_id",
        "label": "Course Label",
        "title": "Course Title"
      },
      "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
        "id": "resource_link_id",
        "title": "Resource Title"
      },
      "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint": {
        "scope": [
          "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
          "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly"
        ],
        "lineitem": "https://canvas.instructure.com/api/lti/courses/course_id/line_items/item_id",
        "lineitems": "https://canvas.instructure.com/api/lti/courses/course_id/line_items"
      }
    };

    // Extract LTI data
    const ltiData = {
      userId: decoded.sub,
      courseId: decoded["https://purl.imsglobal.org/spec/lti/claim/context"]?.id,
      roles: decoded["https://purl.imsglobal.org/spec/lti/claim/roles"] || [],
      resourceLinkId: decoded["https://purl.imsglobal.org/spec/lti/claim/resource_link"]?.id,
      deploymentId: decoded["https://purl.imsglobal.org/spec/lti/claim/deployment_id"],
      messageType: decoded["https://purl.imsglobal.org/spec/lti/claim/message_type"],
      version: decoded["https://purl.imsglobal.org/spec/lti/claim/version"],
      // AGS (Assignment and Grade Services) data
      ags: decoded["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"]
    };

    // Attach LTI data to request
    req.ltiData = ltiData;

    next();
  } catch (error) {
    console.error('LTI 1.3 authentication error:', error);
    res.status(500).json({ message: 'LTI authentication error' });
  }
};

module.exports = {
  authenticateLti1,
  authenticateLti13
}; 