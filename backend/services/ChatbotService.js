const axios = require('axios');

const SYSTEM_CONTEXT = `Bạn là trợ lý AI của Phòng Khám Đa Khoa. Nhiệm vụ của bạn là:
- Tư vấn về triệu chứng và gợi ý chuyên khoa y tế phù hợp
- Trả lời các câu hỏi về dịch vụ khám chữa bệnh tại phòng khám
- Hướng dẫn quy trình đặt lịch khám
- Cung cấp thông tin y tế cơ bản và lời khuyên chăm sóc sức khỏe

Các chuyên khoa có tại phòng khám:
- Tim mạch: nhịp tim, đau ngực, huyết áp
- Da liễu: mụn, nổi mẩn, ngứa, viêm da
- Nhi khoa: bệnh trẻ em dưới 12 tuổi
- Nha khoa: răng, nướu, miệng
- Tai Mũi Họng: ù tai, nghẹt mũi, viêm họng
- Nội khoa: tiểu đường, sốt, mệt mỏi tổng quát
- Chỉnh hình: xương khớp, cột sống, chấn thương
- Phụ khoa: sức khoẻ phụ nữ, kinh nguyệt, thai sản
- Tiêu hoá: đau bụng, tiêu chảy, táo bón, gan
- Tâm thần: đau đầu, mất ngủ, lo âu, trầm cảm
- Hô hấp: ho, khó thở, viêm phổi, hen suyễn

Hãy trả lời ngắn gọn, rõ ràng, thân thiện và hữu ích bằng tiếng Việt.
Khi người dùng mô tả triệu chứng, hãy gợi ý chuyên khoa phù hợp và khuyên họ đặt lịch khám.
Không đưa ra chẩn đoán bệnh cụ thể - chỉ hướng dẫn đến đúng chuyên khoa.`;

const ChatbotService = {
  sendMessage: async (messages) => {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;

      if (!apiKey) {
        return {
          success: false,
          message: 'Không có API key'
        };
      }

      // Build conversation for Gemini, injecting system context into first user message
      const contents = messages.map((msg, idx) => {
        const role = msg.role === 'user' ? 'user' : 'model';
        let text = msg.content;
        if (idx === 0 && role === 'user') {
          text = `${SYSTEM_CONTEXT}\n\n---\nNgười dùng: ${text}`;
        }
        return { role, parts: [{ text }] };
      });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(
        endpoint,
        { contents },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;

      return {
        success: true,
        message: responseText
      };
    } catch (error) {
      console.error('Chatbot service error:', error.response?.status || error.message);
      return {
        success: false,
        message: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.'
      };
    }
  }
};

module.exports = ChatbotService;
