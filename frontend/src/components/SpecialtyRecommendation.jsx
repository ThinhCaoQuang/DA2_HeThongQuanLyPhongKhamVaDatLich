import { useState, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/list.css'

export default function SpecialtyRecommendation({ onSelectSpecialty, onStatusChange }) {
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('') // 'analyzing', 'success', 'error'
  const [selectedSpecialty, setSelectedSpecialty] = useState(null)

  // Auto-recommend when user stops typing (debounce 2 seconds)
  useEffect(() => {
    if (!symptoms.trim()) {
      setStatus('')
      setSelectedSpecialty(null)
      onStatusChange?.('')
      return
    }

    const timer = setTimeout(() => {
      handleAutoRecommend(symptoms)
    }, 2000)

    return () => clearTimeout(timer)
  }, [symptoms])

  const handleAutoRecommend = async (symptomsText) => {
    setLoading(true)
    setStatus('analyzing')
    onStatusChange?.('analyzing')

    try {
      const response = await apiClient.post('/specialty-recommendation/recommend', {
        symptoms: symptomsText
      })

      if (response.data.success && response.data.data.recommendations.length > 0) {
        const topRecommendation = response.data.data.recommendations[0]
        
        // Auto-select top recommendation if it's in the database
        if (topRecommendation.dbId) {
          setSelectedSpecialty(topRecommendation)
          setStatus('success')
          onStatusChange?.('success')
          
          // Auto-call the selection handler
          onSelectSpecialty({
            id: topRecommendation.dbId,
            name: topRecommendation.dbName || topRecommendation.specialty
          })
        } else {
          setStatus('no-match')
          onStatusChange?.('no-match')
        }
      } else {
        setStatus('no-recommendations')
        onStatusChange?.('no-recommendations')
      }
    } catch (err) {
      setStatus('error')
      onStatusChange?.('error')
      console.error('Recommendation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>AI Gợi Ý Chuyên Khoa</h4>
      <label style={{ fontSize: '0.9em', color: '#666', margin: '0 0 10px 0', display: 'block' }}>Triệu chứng</label>

      <textarea
        placeholder=""
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontFamily: 'Arial, sans-serif',
          minHeight: '80px',
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
      />

      {/* Status messages */}
      {loading && status === 'analyzing' && (
        <div style={{
          marginTop: '10px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          color: '#1565c0',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Đang phân tích triệu chứng...</span>
        </div>
      )}

      {status === 'success' && selectedSpecialty && (
        <div style={{
          marginTop: '10px',
          padding: '12px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '4px',
          color: '#2e7d32',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>
            Đã tự động chọn: <strong>{selectedSpecialty.dbName || selectedSpecialty.specialty}</strong>
            <br/>
            <span style={{ fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
              Độ tin cậy: {(selectedSpecialty.confidence * 100).toFixed(0)}%
            </span>
          </span>
        </div>
      )}

      {status === 'no-match' && (
        <div style={{
          marginTop: '10px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Không tìm thấy chuyên khoa phù hợp. Vui lòng chọn chuyên khoa thủ công.</span>
        </div>
      )}

      {status === 'no-recommendations' && (
        <div style={{
          marginTop: '10px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Không thể phân tích triệu chứng. Vui lòng cộng lại hoặc chọn chuyên khoa thủ công.</span>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          marginTop: '10px',
          padding: '12px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#c62828',
          fontSize: '0.9em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Lỗi khi kết nối với AI. Vui lòng chọn chuyên khoa thủ công.</span>
        </div>
      )}
    </div>
  )
}
