import '../styles/Loading.css';

export default function Loading() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="loading-text">Đang tải dữ liệu...</div>
    </div>
  );
}
