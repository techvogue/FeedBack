import { motion } from "framer-motion";
import { FaRegChartBar, FaUserCheck, FaLink, FaEdit } from "react-icons/fa";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { FiZap } from "react-icons/fi";
import { AiOutlineRobot } from "react-icons/ai";

const features = [
  {
    icon: <FaEdit className="text-3xl text-indigo-500" />,
    title: "Custom Form Builder",
    desc: "Drag-and-drop builder with text, MCQ, rating, and file upload. Mark questions as required easily.",
  },
  {
    icon: <FaLink className="text-3xl text-pink-500" />,
    title: "Share Instantly",
    desc: "Share forms with a unique link or QR code. No login needed for respondents.",
  },
  {
    icon: <FaRegChartBar className="text-3xl text-teal-500" />,
    title: "Real-time Analytics",
    desc: "Visual dashboards, response metrics, charts, and filters to understand audience feedback.",
  },
  {
    icon: <AiOutlineRobot className="text-3xl text-orange-500" />,
    title: "AI-powered Insights",
    desc: "Auto-summarize feedback, extract sentiment and highlight key concerns using AI.",
  },
  {
    icon: <FaUserCheck className="text-3xl text-yellow-500" />,
    title: "Secure Login",
    desc: "Simple, secure login/signup for organizers using email or social platforms.",
  },
  {
    icon: <MdOutlineQrCodeScanner className="text-3xl text-purple-500" />,
    title: "QR Feedback Mode",
    desc: "Attendees scan and instantly access your form—super useful for live sessions!",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white min-h-screen font-sans">
      {/* Hero */}
      <section className="relative px-6 md:px-20 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300"
        >
          FeedbackFlow – Capture Event Feedback That Matters
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
        >
          A beautiful SaaS tool for event organizers to collect, analyze, and act on attendee feedback with ease.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 bg-white text-black font-semibold px-8 py-3 rounded-full shadow-xl hover:bg-gray-200 transition"
        >
          Get Started Free
        </motion.button>
      </section>

      {/* Features */}
      <section className="px-6 md:px-20 py-16 bg-opacity-30 backdrop-blur-md">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why FeedbackFlow?</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white bg-opacity-5 rounded-2xl p-6 shadow-xl border border-white/10 hover:shadow-2xl transition duration-300 backdrop-blur-md"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        whileInView={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 md:px-20 text-center bg-white bg-opacity-5 backdrop-blur-md rounded-t-3xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to elevate your event feedback?
        </h2>
        <p className="text-gray-300 max-w-xl mx-auto mb-8">
          Sign up and start creating stunning feedback forms in minutes — no design or coding required.
        </p>
        <button className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-full text-white font-semibold shadow-lg">
          Try FeedbackFlow Free
        </button>
      </motion.section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-gray-400">
        © {new Date().getFullYear()} FeedbackFlow · Crafted with ❤️ for event professionals
      </footer>
    </div>
  );
}
