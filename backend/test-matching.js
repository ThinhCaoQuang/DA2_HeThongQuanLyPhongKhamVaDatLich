// Test script to verify string matching
const testMatch = () => {
  const testCases = [
    { db: 'Tiêu hoá', ai: 'Tieu hoa' },
    { db: 'Tim mạch', ai: 'Tim mach' },
    { db: 'Da liễu', ai: 'Da lieu' },
    { db: 'Nhi khoa', ai: 'Nhi khoa' },
    { db: 'Nha khoa', ai: 'Nha khoa' },
    { db: 'Tai Mũi Họng', ai: 'Tai Mui Hong' },
    { db: 'Nội khoa', ai: 'Noi khoa' },
    { db: 'Chỉnh hình', ai: 'Chinh hinh' },
    { db: 'Phụ khoa', ai: 'Phu khoa'},
    { db: 'Tâm thần', ai: 'Tam than' }
  ];

  console.log('Testing specialty name matching:\n');
  
  testCases.forEach(({db, ai}) => {
    const dbNorm = db.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const aiNorm = ai.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const match = dbNorm === aiNorm;
    
    console.log(`DB: "${db}" -> "${dbNorm}"`);
    console.log(`AI: "${ai}" -> "${aiNorm}"`);
    console.log(`Match: ${match ? '✓' : '✗'}\n`);
  });
};

testMatch();
