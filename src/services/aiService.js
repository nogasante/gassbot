const { config } = require('../config');

/**
 * Modular AI Service Interface
 * Prepared for future integration with Google Gemini API for statistical tutoring.
 */
class AIService {
  constructor() {
    this.isEnabled = config.aiEnabled;
  }

  /**
   * Ask the academic tutor a question about statistical concepts or courses
   * @param {Object} options
   * @param {string} options.query - Student question
   * @param {string} [options.courseCode] - Relevant KNUST course code
   * @param {number} [options.academicLevel] - 100, 200, 300, or 400
   * @returns {Promise<{ answer: string, sources?: string[] }>}
   */
  async askAcademicTutor({ query, courseCode, academicLevel }) {
    if (!this.isEnabled) {
      return {
        available: false,
        message: 'The GASS Academic AI Tutor is currently undergoing scheduled development and will launch in an upcoming release. Please check curriculum materials or submit a resource request!'
      };
    }

    // Future Gemini API integration will be initialized here
    return {
      available: true,
      answer: `AI Tutor response placeholder for: "${query}" (Course: ${courseCode || 'General'})`,
      sources: []
    };
  }
}

module.exports = new AIService();
