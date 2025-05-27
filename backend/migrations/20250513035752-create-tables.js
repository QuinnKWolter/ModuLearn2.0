'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* ─────────────────────────────────────────────────────────── Users */
    await queryInterface.createTable('Users', {
      id:             { type: Sequelize.UUID,  defaultValue: Sequelize.UUIDV4, primaryKey: true },
      email:          { type: Sequelize.STRING, allowNull: false, unique: true },
      password:       { type: Sequelize.STRING },                           // NULL when user is invited
      fullName:       { type: Sequelize.STRING },
      roles:          { type: Sequelize.JSONB,  defaultValue: { student: true, instructor: false, researcher: false } },
      status:         { type: Sequelize.ENUM('active', 'invited', 'disabled'), defaultValue: 'active' },
      inviteToken:    { type: Sequelize.UUID },
      mustResetPw:    { type: Sequelize.BOOLEAN, defaultValue: false },
      emailVerified:  { type: Sequelize.BOOLEAN, defaultValue: false },
      ltiUserId:      { type: Sequelize.STRING },
      lti_data:       { type: Sequelize.JSONB },
      course_authoring_password: { type: Sequelize.STRING },
      refreshToken:   { type: Sequelize.STRING(1024) },
      lastLogin:      { type: Sequelize.DATE },
      avatar:         { type: Sequelize.STRING },
      isActive:       { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false }
    });

    /* ────────────────────────────────────────────────────────── Courses */
    await queryInterface.createTable('Courses', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title:         { type: Sequelize.STRING, allowNull: false },
      description:   { type: Sequelize.TEXT },
      ltiCourseId:   { type: Sequelize.STRING },
      ltiContextId:  { type: Sequelize.STRING },
      status:        { type: Sequelize.ENUM('draft','published','archived'), defaultValue: 'draft', allowNull: false },
      metadata:      { type: Sequelize.JSON },
      settings:      { type: Sequelize.JSONB, defaultValue: {} },
      isActive:      { type: Sequelize.BOOLEAN, defaultValue: true },
      createdById:   { type: Sequelize.UUID, allowNull: false,
                       references: { model: 'Users', key: 'id' },
                       onUpdate:   'CASCADE', onDelete: 'CASCADE' },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false }
    });

    /* ───────────────────────────────────────────────────────── Sessions */
    await queryInterface.createTable('Sessions', {
      id:         { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      groupName:  { type: Sequelize.STRING, allowNull: false },
      isActive:   { type: Sequelize.BOOLEAN, defaultValue: true },
      CourseId:   { type: Sequelize.UUID,
                    references: { model: 'Courses', key: 'id' },
                    onUpdate:   'CASCADE', onDelete: 'CASCADE' },
      metadata:   { type: Sequelize.JSON },
      createdAt:  { type: Sequelize.DATE, allowNull: false },
      updatedAt:  { type: Sequelize.DATE, allowNull: false }
    });

    /* ─────────────────────────────────────────────────────────── Units */
    await queryInterface.createTable('Units', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title:       { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      unitType:    { type: Sequelize.STRING, defaultValue: 'content' },
      content:     { type: Sequelize.JSON },
      order:       { type: Sequelize.INTEGER, defaultValue: 0 },
      metadata:    { type: Sequelize.JSON },
      CourseId:    { type: Sequelize.UUID,
                     references: { model: 'Courses', key: 'id' },
                     onUpdate:   'CASCADE', onDelete: 'CASCADE' },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false }
    });

    /* ───────────────────────────────────────────────────────── Modules */
    await queryInterface.createTable('Modules', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title:       { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      content:     { type: Sequelize.JSON },
      providerId:  { type: Sequelize.STRING },
      authorId:    { type: Sequelize.STRING },
      url:         { type: Sequelize.TEXT },
      tags:        { type: Sequelize.JSONB },
      metadata:    { type: Sequelize.JSON },
      order:       { type: Sequelize.INTEGER, defaultValue: 0 },
      UnitId:      { type: Sequelize.UUID,
                     references: { model: 'Units', key: 'id' },
                     onUpdate:   'CASCADE', onDelete: 'CASCADE' },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false }
    });

    /* ─────────────────────────────────────────────────────── Enrollments */
    await queryInterface.createTable('Enrollments', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      UserId:     { type: Sequelize.UUID,
                    references: { model: 'Users', key: 'id' },
                    onDelete:   'CASCADE' },
      SessionId:  { type: Sequelize.UUID,
                    references: { model: 'Sessions', key: 'id' },
                    onDelete:   'CASCADE' },
      role:       { type: Sequelize.STRING, defaultValue: 'student' },
      isActive:   { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:  { type: Sequelize.DATE, allowNull: false },
      updatedAt:  { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex(
      'Enrollments', ['UserId', 'SessionId'],
      { unique: true, name: 'enrollment_unique_user_session' }
    );

    /* ────────────────────────────────────────────────── CourseInstructors */
    await queryInterface.createTable('CourseInstructors', {
      id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      UserId:    { type: Sequelize.UUID,
                   references: { model: 'Users', key: 'id' },
                   onDelete:   'CASCADE' },
      CourseId:  { type: Sequelize.UUID,
                   references: { model: 'Courses', key: 'id' },
                   onDelete:   'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex(
      'CourseInstructors', ['UserId', 'CourseId'],
      { unique: true, name: 'course_instructor_unique' }
    );

    /* ──────────────────────────────────────────────────────── Progress  */
    await queryInterface.createTable('Progress', {
      id:         { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      EnrollmentId:{ type: Sequelize.INTEGER,
                     references: { model: 'Enrollments', key: 'id' },
                     onDelete:   'CASCADE' },
      ModuleId:   { type: Sequelize.UUID,
                    references: { model: 'Modules', key: 'id' },
                    onDelete:   'CASCADE' },

      /* analytics */
      state:            { type: Sequelize.JSONB,  defaultValue: {} },
      percent:          { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
      score:            { type: Sequelize.FLOAT },
      maxScore:         { type: Sequelize.FLOAT },
      completed:        { type: Sequelize.BOOLEAN, defaultValue: false },
      attempts:         { type: Sequelize.INTEGER, defaultValue: 1 },
      startedAt:        { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      completedAt:      { type: Sequelize.DATE },
      lastInteractionAt:{ type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      submittedToLms:   { type: Sequelize.BOOLEAN, defaultValue: false },

      createdAt:        { type: Sequelize.DATE, allowNull: false },
      updatedAt:        { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex(
      'Progress', ['ModuleId', 'EnrollmentId'],
      { unique: true, name: 'progress_unique_module_enrollment' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Progress');
    await queryInterface.dropTable('CourseInstructors');
    await queryInterface.dropTable('Enrollments');
    await queryInterface.dropTable('Modules');
    await queryInterface.dropTable('Units');
    await queryInterface.dropTable('Sessions');
    await queryInterface.dropTable('Courses');
    await queryInterface.dropTable('Users');
  }
};