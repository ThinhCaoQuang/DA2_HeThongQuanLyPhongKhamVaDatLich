const ChatbotService = require('../services/ChatbotService');

const ChatbotController = {
  sendMessage: async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng gửi tin nhắn'
        });
      }

      // Validate message structure
      for (const msg of messages) {
        if (!msg.role || !msg.content || typeof msg.content !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Định dạng tin nhắn không hợp lệ'
          });
        }
      }

      const result = await ChatbotService.sendMessage(messages);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Chatbot controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ'
      });
    }
  }
};

module.exports = ChatbotController;
