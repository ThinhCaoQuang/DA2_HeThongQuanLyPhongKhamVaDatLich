const axios = require('axios');

const AIService = {
  // AI-powered specialty recommendation using Google Gemini API
  recommendSpecialties: async (symptoms) => {
    try {
      if (!symptoms || symptoms.trim() === '') {
        return {
          success: false,
          message: 'Vui long nhap trieu chung'
        };
      }

      // Try keyword-based matching FIRST - more reliable for medical terms
      const keywordResult = fallbackKeywordMatching(symptoms);
      if (keywordResult.data.recommendations.length > 0) {
        return keywordResult;
      }

      // If keyword matching returns nothing, try Google Gemini API
      const aiResult = await useGoogleGeminiForRecommendation(symptoms);
      if (aiResult.success) {
        return aiResult;
      }

      // Fallback to basic recommendation if both fail
      return {
        success: true,
        data: {
          recommendations: [{
            specialty: 'Kham tong quat',
            confidence: 0.5,
            reason: 'Vui long chon chuyen khoa phu hop'
          }],
          warning: null,
          source: 'default'
        }
      };
    } catch (error) {
      console.error('AI Service error:', error.message);
      // Last resort
      return fallbackKeywordMatching(symptoms);
    }
  }
};

// Google Gemini AI-powered recommendation
async function useGoogleGeminiForRecommendation(symptoms) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.log('No GOOGLE_API_KEY found');
      return { success: false };
    }

    console.log('Google API Key found:', apiKey.substring(0, 20) + '...');

    const prompt = `Bạn là một bác sĩ chẩn đoán giỏi. Dựa trên triệu chứng mà bệnh nhân mô tả, hãy giới thiệu 3-5 chuyên khoa y tế phù hợp nhất theo thứ tự ưu tiên.

DANH SÁCH CÁC CHUYÊN KHOA:
1. Tim mạch (Cardiology) - Nhịp tim, đau ngực, huyết áp cao, yếu tay chân, chóng mặt liên quan tim
2. Da liễu (Dermatology) - Mụn, nổi mẩn, ngứa, nám, sẹo da, viêm da
3. Nhi khoa (Pediatrics) - CHỈ cho TRẺ EM dưới 12 tuổi: sốt cao, ho, tiêu chảy ở trẻ, phát triển bất thường
4. Nha khoa (Dentistry) - Đau răng, mảng bám, chảy máu nướu, viêm lợi, mẻ xương hàm
5. Tai Mũi Họng (ENT) - Ù tai, chảy máu mũi, ho kéo dài, hạt giọng, viêm amidan, nứt họng
6. Nội khoa (Internal Medicine) - Sốt, cảm cúm, cô đặc, chán ăn, yếu cơ thể, buồn nôn (không liên quan tiêu hóa)
7. Chỉnh hình (Orthopedics) - Gãy xương, bong gân, đau cột sống, đau khớp, chấn thương
8. Phụ khoa (Gynecology) - Kinh nguyệt bất thường, mang thai, đau vùng chậu, khí hư
9. Tiêu hoá (Gastroenterology) - Đau bụng, tiêu chảy ở người lớn, nôn, ợ chua, chứng ợ hơi, táo bón, gan
10. Tâm thần (Psychiatry) - Đau đầu, chóng mặt, lo âu, stress, mất ngủ, trầm cảm, rối loạn tâm thần
11. Hô hấp (Respiratory) - Ho, sốt, khó thở, viêm phổi, hen suyễn, khó thở, đau ngực khi ho

TRIỆU CHỨNG CỦA BỆNH NHÂN: "${symptoms}"

LƯU Ý QUAN TRỌNG:
- Nhi khoa CHỈ dành cho TRẺ EM. Nếu không nhắc tới tuổi trẻ em, KHÔNG chọn Nhi khoa
- Đau bụng + tiêu chảy + buồn nôn → TIÊU HÓA
- Sốt ở người lớn → NỘI KHOA hoặc CẤP CỨU (nếu sốt rất cao)
- Hãy ưu tiên chuyên khoa CHÍNH XÁC NHẤT theo triệu chứng

Phân tích và trả lời dưới dạng JSON (CHỈ JSON, không có text khác):
{
  "recommendations": [
    {"specialty": "Tên chuyên khoa tiếng Việt", "confidence": 0.95, "reason": "Giải thích ngắn gọn"},
    ...
  ]
};

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log('Calling endpoint:', endpoint.substring(0, 80) + '...');

    const response = await axios.post(
      endpoint,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    // Parse Google Gemini response
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Process recommendations
    const recommendations = (parsed.recommendations || [])
      .filter(rec => rec.confidence && rec.confidence > 0.15)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(rec => ({
        specialty: rec.specialty.split(' - ')[0].trim(),
        confidence: rec.confidence,
        reason: rec.reason
      }));

    if (recommendations.length === 0) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        recommendations,
        warning: null,
        source: 'google-gemini'
      }
    };
  } catch (error) {
    console.error('Google Gemini API error:', error.response?.status || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    return { success: false };
  }
}

// Enhanced keyword-based matching with comprehensive medical terminology
function fallbackKeywordMatching(symptoms) {
  const symptomsLower = symptoms.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const specialtyMap = [
    {
      specialty: 'Tim mach',
      keywords: [
        // Cardiac symptoms
        'tim', 'mach', 'tim mach', 'that tim', 'suy tim', 'tim yeu', 'rut tim', 'dau tim', 'dau nguc', 'ngan nguc',
        // Heart rhythm issues
        'tac mach', 'tac mach nhanh', 'chap choe', 'tim dap nhanh', 'tim dap chanh choang', 'tim dap bo xo', 'khong dap deu',
        // Heart failure symptoms
        'ho khan', 'tho kho', 'kho tho', 'yeu tay chan', 'met moi', 'phu ban',
        // Cardiovascular issues
        'huyet ap cao', 'cao huyet ap', 'ma vang',
        // Vascular
        'canh tay co', 'canh tay teo', 'chan co', 'cau mau'
      ],
      confidence: 0.95
    },
    {
      specialty: 'Da lieu',
      keywords: [
        // Skin conditions
        'da', 'noi mut', 'mut', 'nam da', 'vay', 'cham', 'viem da', 'di ung da', 'di ung', 'eczema',
        // Specific skin issues
        'ngan gan', 'hang', 'ghe', 'lang ben', 'mut com', 'mut mu', 'mut trang', 'mut dau den',
        // Skin appearance
        'da san', 'da kho', 'da am', 'da dau', 'da nhon', 'kho da', 'nut da', 'ban da',
        // Itching and inflammation
        'ngua da', 'ngua gay', 'viem da tep', 'do da', 'man do', 'seo da', 'viem da co the',
        // Burns and wounds
        'tat nang', 'seo', 'tat thap'
      ],
      confidence: 0.9
    },
    {
      specialty: 'Nhi khoa',
      keywords: [
        // Age indicators - MUST HAVE at least one of these for pediatrics
        'tre em', 'em be', 'be', 'nhi', 'tre', 'tre so sinh', 'tre sot sinh', 'con', 'co hanh',
        'tuoi', 'tuoi tho', 'be trai', 'be gai',
        // Common pediatric conditions (ONLY if age indicator found)
        'sot cao o tre', 'sot o be', 'cam cum tre', 'ho ga', 'tieu chay tre em',
        // Developmental issues
        'phat trien tre', 'tre chap chung', 'di chuyen kho khan', 'noi nho tre', 'khong hoc duoc',
        // Specific conditions
        'dong kinh o tre', 'co giat o tre', 'benh tim bam sinh', 'di tac tim', 'soi', 'tieu tiet',
        // Behavioral
        'quay khoc', 'khoc nhieu', 'binh bong', 'an khong yeu thich', 'nuot kho khan'
      ],
      confidence: 0.92
    },
    {
      specialty: 'Nha khoa',
      keywords: [
        // Teeth and mouth
        'rang', 'nha', 'nha rang', 'cai cap', 'rang ho lung', 'rang mac lung',
        // Gum issues
        'viem nuoi', 'nuoi sore', 'nuoi chay mau', 'nuoi sung', 'nuoi do', 'nuoi viem',
        // Tooth problems
        'nhuc rang', 'dau rang', 'rang sau', 'rang spa', 'rang tay calculus', 'nhan vang', 'nhan dac',
        // Oral issues
        'an can', 'an can cao', 'mouth ulcer', 'vet loet', 'loet mieng', 'kho mieng', 'mat dan mieng',
        // Bite and alignment
        'lech can', 'voi rang', 'rang hoi lung', 'rang hoi mac', 'khop cam sai',
        // Extraction and treatment
        'rang lung', 'rang mac', 'dau khi manh rang'
      ],
      confidence: 0.92
    },
    {
      specialty: 'Tai Mui Hong',
      keywords: [
        // Ear
        'tai', 'viem tai', 'dau tai', 'chi tai', 'diec', 'am thanh', 'am', 'viem tai giua', 'viem tai ngoai',
        // Nose
        'mui', 'so mui', 'tac mui', 'mui tay', 'chay mau mui', 'viem mui xoang', 'viem xoang',
        // Throat
        'hong', 'viem hong', 'dau hong', 'sung hong', 'am', 'khan giong',
        // Speech and voice
        'khan giong', 'giong khap', 'mat giong', 'en giong', 'noi kho khan',
        // Adenoids and tonsils
        'u tai', 'amidan', 'amidan to', 'viem amidan', 'u amidan', 'vom hong', 'viem thanh quan',
        // General ENT
        'noi quai', 'quai sung', 'sot nho voi sot', 'cam cum', 'cam lanh', 'cao dap'
      ],
      confidence: 0.92
    },
    {
      specialty: 'Noi khoa',
      keywords: [
        // Diabetes and endocrine
        'tieu duong', 'duong huyet', 'huyet duong', 'insulin', 'duong huyet cao', 'tieu nhieu', 'khat nuoc nhieu',
        // Metabolic
        'trao doi chat', 'beo phi', 'tang can', 'giam can', 'thay doi can nang',
        // General symptoms
        'met moi', 'yeu', 'buon an', 'an nhieu', 'khat nuoc', 'roi loan tieu hoa',
        // Hypertension
        'huyet ap cao', 'cao huyet ap', 'huyet ap', 'dau lam', 'chong mat', 'chong vang',
        // Hypotension
        'huyet ap thap', 'ma vang', 'xay tim', 'yeu tim',
        // Infections and fever
        'sot cao', 'sot', 'sot dai', 'tieu chay', 'non', 'viem',
        // Hormone issues
        'noi tiet', 'hormone', 'kinh tam tam', 'suy noi tiet', 'tang noi tiet',
        // General internal medicine
        'benh may', 'hen', 'viem duong tho tren'
      ],
      confidence: 0.92
    },
    {
      specialty: 'Chinh hinh',
      keywords: [
        // Spine
        'dau lung', 'dau co', 'dau vai', 'cot song', 'gai cot song', 'thoat vi dia', 'van di dia',
        // Fractures
        'gay xuong', 'gay xuong chi', 'gay xuong ban', 'xuong gat',
        // Joints
        'dau khop', 'viem khop', 'khop sung', 'khop yeu', 'khop chai',
        // Muscles and ligaments
        'coi', 'can co', 'can co co', 'can co thanh', 'chan thuong', 'chho chan', 'bong gan',
        // Degeneration
        'thoai hoa', 'thoai hoa khop', 'thoai hoa cot song', 'co the thoai hoa',
        // Posture and alignment
        'khong hang', 'cong lung', 'khong hang khop', 'lech', 'van lech',
        // Specific areas
        'dau got chan', 'dau non co', 'dau bep can', 'u xuong', 'u xuong hang mo'
      ],
      confidence: 0.95
    },
    {
      specialty: 'Phu khoa',
      keywords: [
        // Menstrual
        'kinh', 'kinh nguyet', 'kinh tam tam', 'kinh khong deu', 'kinh qua nhieu', 'kinh qua it', 'kinh cam dong',
        // Pregnancy related
        'thai', 'dang thai', 'sap sinh', 'sau sinh', 'thai ngoai tu cung', 'viet mau',
        // Fertility
        'vo sinh', 'khong con', 'suy sinh duc', 'thiep', 'co gai',
        // Pelvic and uterine
        'tu cung', 'dau tu cung', 'viem tu cung', 'buong trung', 'u buong trung', 'nang',
        // Hormonal
        'co the nong', 'du', 'tum tut', 'buon non', 'lung tung', 'sua',
        // Vaginal and cervical
        'khong doc', 'khong doc hoi', 'chay xuat huyeti', 'viem', 'to la', 'u ung',
        // Sexual health
        'dau bung duoi', 'dau bung san', 'teo va chi', 'kho tieu', 'sot',
        // Menopausal
        'tui suy', 'me buon', 'them nong'
      ],
      confidence: 0.92
    },
    {
      specialty: 'Tieu hoa',
      keywords: [
        // GI tract
        'da day', 'da day non', 'viem da day', 'da day yeu', 'tao bon', 'tao bon da day',
        // Vomiting and nausea
        'buon non', 'non', 'non biem', 'non mua', 'sot non', 'non gay',
        // Bowel issues - VERY IMPORTANT FOR THIS CASE
        'tieu chay', 'tieu chay dai', 'tieu chay tiem', 'tao bon', 'di tieu kho', 'kho tieu',
        'di ngoai', 'di ngoai nhieu', 'di tieu nhieu', 'phan', 'phan chi',
        // Abdominal
        'dau bung', 'bung', 'dau bung theo sau an', 'tro tro bung', 'chuong bung', 'day bung',
        // Digestive
        'kho tieu', 'au am dau day', 'amp thoat', 'trao nguoc axit', 'hay soi', 'op chua',
        // Bleeding
        'viet mau', 'phan den', 'phan co mau', 'nay ruot',
        // Liver and gallbladder
        'gan', 'rat gan', 'dan', 'som dan', 'u dan', 'benh gan',
        // Parasites and infection
        'sot ho', 'chan day', 'tru sinh', 'vi khuan'
      ],
      confidence: 0.92
    },
    {
      specialty: 'Tam than',
      keywords: [
        // Headache and dizziness
        'dau dau', 'dau dau so', 'dau dau dau', 'chong mat', 'chong vang', 'xay tim', 'me nao',
        // Neurological
        'than kinh', 'tay run', 'chan te', 'te chi', 'liet', 'co giat', 'co giat co thiem',
        // Psychiatric
        'tam than', 'tram cam', 'lo au', 'lo sot', 'cang thang', 'stress', 'an sot', 'buon', 'gust',
        // Sleep
        'mat ngu', 'kho ngu', 'khong ngu', 'ngu nhieu', 'ngu khong sac',
        // Cognitive
        'nho', 'suy nho', 'kho tap trung', 'lap lang', 'luc lu', 'ben', 'bam minh',
        // Behavioral
        'co hanh huong ban', 'bat an', 'can than', 'lan man', 'gat gau',
        // Pain syndromes
        'dau dau dai', 'dau dau tien trai', 'dau dau biec', 'dau xoa', 'cot song dau',
        // Other
        'cam giac', 'cam giac gian', 'am anh', 'co hanh la'
      ],
      confidence: 0.9
    },
    {
      specialty: 'Ho hap',
      keywords: [
        // Cough
        'ho', 'ho kho', 'ho co dom', 'ho hai', 'ho dai', 'ho khan', 'ho the', 'ho co khay',
        // Breathing issues
        'kho tho', 'tho kho khan', 'tho gap', 'tho nhanh', 'tho san', 'hat hoi', 'nghen tho',
        // Fever and infection
        'sot', 'sot cao', 'sot dai', 'sot nho co com', 'sot sot', 'cam cum', 'cam lanh',
        // Upper respiratory
        'cam lanh', 'cam cum', 'viem duong tho tren', 'viem hong', 'viem tai mui hong', 'chi xuat',
        // Pneumonia and bronchitis
        'viem phoi', 'viem phoi virus', 'viem phoi vi khuan', 'viem the quan', 'viem phe quan', 'viem the nho',
        // Lung disease
        'benh phoi', 'phoi yeu', 'phoi teoai', 'xo phoi', 'xo phoi man tinh',
        // Asthma
        'hen', 'hen suyzen', 'hen co', 'co giat', 'co giat he so',
        // Chest pain
        'dau nguc', 'ngan nguc', 'dau sot', 'dau man', 'thuc thuc',
        // Hemoptysis
        'ho mau', 'pho ho mau', 'xuat huyet duong tho',
        // Other
        'co minh', 'mau mau', 'cang co lung xia', 'mat hoi', 'tho deo', 'co tho deo'
      ],
      confidence: 0.92
    }
  ];

  const recommendations = specialtyMap
    .map(spec => {
      // Count keyword matches
      const matchedKeywords = spec.keywords.filter(keyword => symptomsLower.includes(keyword));
      const matchCount = matchedKeywords.length;
      
      if (matchCount === 0) {
        return {
          specialty: spec.specialty,
          confidence: 0,
          reason: 'Khong khop voi tu khoa'
        };
      }
      
      // Keyword matching score: count vs total, weighted by specialty base confidence
      const baseScore = matchCount / spec.keywords.length;
      const weightedScore = Math.min(0.95, 0.3 + baseScore * 0.65) * spec.confidence;
      
      return {
        specialty: spec.specialty,
        confidence: Math.min(0.98, weightedScore),
        reason: `${matchCount} trieu chung phu hop`
      };
    })
    .filter(rec => rec.confidence > 0.15)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  if (recommendations.length === 0) {
    return {
      success: true,
      data: {
        recommendations: [{
          specialty: 'Kham tong quat',
          confidence: 0.5,
          reason: 'Vui long chon chuyen khoa phu hop'
        }],
        warning: null,
        source: 'keyword-fallback'
      }
    };
  }

  return {
    success: true,
    data: {
      recommendations,
      warning: null,
      source: 'keyword-fallback'
    }
  };
}

module.exports = AIService;
