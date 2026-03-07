import Header from './Header'
import Sidebar from './Sidebar'
import '../styles/layout.css'

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="main-content">
          <div className="page-wrapper">{children}</div>
        </main>
      </div>
    </>
  )
}
