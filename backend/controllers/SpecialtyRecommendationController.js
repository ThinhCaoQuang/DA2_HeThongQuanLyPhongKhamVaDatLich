const { ChuyenKhoa } = require('../models');
const AIService = require('../services/AIService');

const SpecialtyRecommendationController = {
  // Recommend specialties based on user symptoms using AI
  recommendBySymptoms: async (req, res) => {
    try {
      console.log('=== recommendBySymptoms called ===');
      console.log('Request body:', req.body);
      
      const { symptoms } = req.body;

      if (!symptoms || symptoms.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập triệu chứng'
        });
      }

      console.log('Symptoms:', symptoms);

      // Get AI recommendations
      const aiResult = await AIService.recommendSpecialties(symptoms);
      console.log('AI Result:', aiResult);

      if (!aiResult.success) {
        return res.status(500).json({
          success: false,
          message: aiResult.message,
          error: aiResult.error
        });
      }

      // Mapping of AI specialty names to database specialty names
      const aiToDbMap = {
        'tim mach': 'Tim mạch',
        'da lieu': 'Da liễu',
        'nhi khoa': 'Nhi khoa',
        'nha khoa': 'Nha khoa',
        'tai mui hong': 'Tai Mũi Họng',
        'noi khoa': 'Nội khoa',
        'chinh hinh': 'Chỉnh hình',
        'phu khoa': 'Phụ khoa',
        'tieu hoa': 'Tiêu hoá',
        'tam than': 'Tâm thần',
        'ho hap': 'Hô hấp'
      };

      // Fetch actual specialties from database
      const allSpecialties = await ChuyenKhoa.findAll({
        attributes: ['ChuyenKhoaId', 'TenChuyenKhoa', 'MoTa']
      });

      // Create a lookup map for faster access
      const specialtiesByName = {};
      allSpecialties.forEach(spec => {
        specialtiesByName[spec.TenChuyenKhoa] = spec;
      });

      // Match AI recommendations with database specialties
      const matchedRecommendations = (aiResult.data.recommendations || []).map(rec => {
        // Normalize AI specialty name for lookup
        const aiNormalized = rec.specialty.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Get database specialty name from mapping
        const dbSpecialtyName = aiToDbMap[aiNormalized];
        
        // Find specialty in database
        const matchedSpec = dbSpecialtyName ? specialtiesByName[dbSpecialtyName] : null;

        return {
          specialty: rec.specialty,
          confidence: rec.confidence,
          reason: rec.reason,
          dbId: matchedSpec?.ChuyenKhoaId || null,
          dbName: matchedSpec?.TenChuyenKhoa || null
        };
      });

      // Sort by confidence (descending)
      matchedRecommendations.sort((a, b) => b.confidence - a.confidence);

      res.status(200).json({
        success: true,
        data: {
          symptoms: symptoms,
          recommendations: matchedRecommendations,
          warning: aiResult.data.warning,
          totalRecommendations: matchedRecommendations.length
        }
      });
    } catch (error) {
      console.error('Specialty recommendation error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  },

  // Get all specialties for dropdown
  getAllSpecialties: async (req, res) => {
    try {
      const specialties = await ChuyenKhoa.findAll({
        attributes: ['ChuyenKhoaId', 'TenChuyenKhoa', 'MoTa'],
        order: [['TenChuyenKhoa', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: specialties
      });
    } catch (error) {
      console.error('Get specialties error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }
};

module.exports = SpecialtyRecommendationController;
