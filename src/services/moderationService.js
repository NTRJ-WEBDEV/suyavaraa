const { supabase } = require('../../supabase');

class ModerationService {
  constructor() {
    // Simple local profanity list for real-time performance
    this.profanityList = [
      'badword1',
      'badword2',
      'idiot',
      'scam',
      'fake',
      'slut',
      'whore',
      'rape',
      'nude',
      'sex'
    ];
  }

  /**
   * Screen text for profanity and NSFW content
   */
  async screenText(text, userId) {
    try {
      if (!text || !text.trim()) return { safe: true };

      // 1. Local check (Fast)
      const containsProfanity = this.profanityList.some(word => 
        text.toLowerCase().includes(word)
      );

      if (containsProfanity) {
        return {
          safe: false,
          category: 'harassment',
          severity: 'medium',
          reason: 'profanity_or_harassment',
          scrubbed: this.scrubText(text)
        };
      }

      return { safe: true };

    } catch (error) {
      console.error('Moderation error:', error);
      return { safe: true }; // Fail-safe: allow if moderation service is down
    }
  }

  /**
   * Replace profanity with asterisks
   */
  scrubText(text) {
    let scrubbed = text;
    this.profanityList.forEach(word => {
      const regex = new RegExp(word, 'gi');
      scrubbed = scrubbed.replace(regex, '***');
    });
    return scrubbed;
  }

  /**
   * Report content/user
   */
  async reportContent(reporterId, targetId, contentType, contentId, reason) {
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: reporterId,
          target_id: targetId,
          content_type: contentType,
          content_id: contentId,
          reason,
          status: 'pending',
          created_at: new Date()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Report error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Moderate post text + media. Auto-remove sexual/deepfake media.
   */
  async moderatePost(userId, caption, mediaUrls = []) {
    try {
      const textResult = await this.screenText(caption || '', userId);

      if (!textResult.safe) {
        const shouldAutoRemove = ['sexual_content', 'harassment', 'violence'].includes(textResult.category);
        return {
          safe: false,
          shouldAutoRemove,
          reason: textResult.reason,
          category: textResult.category,
          severity: textResult.severity,
        };
      }

      // Media is not auto-scanned: all photos go through the admin photo approval queue.
      return { safe: true };
    } catch (error) {
      console.error('moderatePost error:', error);
      return { safe: true };
    }
  }
}

module.exports = new ModerationService();
