import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Landing = () => (
  <Layout>
    <section className="text-center py-16 md:py-24">
      <div className="inline-block bg-primary-light text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
        Emergency Blood Donation System
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        🩸 Blood-Link
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
        Connect patients in need with verified nearby donors. Fast, reliable, and
        life-saving blood donation coordination when every minute counts.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/login" className="btn-primary text-lg px-8">
          Login
        </Link>
        <Link to="/register" className="btn-outline text-lg px-8">
          Register as Donor
        </Link>
        <Link to="/register-patient" className="btn-outline text-lg px-8">
          Register as Patient
        </Link>
      </div>
    </section>

    <section className="grid md:grid-cols-3 gap-6 pb-16">
      {[
        {
          title: 'For Patients',
          desc: 'Create urgent blood requests and track status in real time.',
          icon: '🏥',
        },
        {
          title: 'For Donors',
          desc: 'Get notified of nearby requests and accept when available.',
          icon: '❤️',
        },
        {
          title: 'Verified & Safe',
          desc: 'OTP phone verification and unique Aadhaar for donor trust.',
          icon: '✅',
        },
      ].map((item) => (
        <div key={item.title} className="card text-center">
          <div className="text-4xl mb-3">{item.icon}</div>
          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
          <p className="text-gray-600 text-sm">{item.desc}</p>
        </div>
      ))}
    </section>
  </Layout>
);

export default Landing;
