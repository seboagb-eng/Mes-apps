import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="app-container">
      <div style={{position:'absolute',top:-46,right:-38,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle at 40% 40%,#FFE08A,var(--soleil))',opacity:.85}}></div>
      <div style={{position:'absolute',left:'-10%',width:'120%',height:180,borderRadius:'50% 50% 0 0',bottom:56,background:'#7FCB92',opacity:.75}}></div>
      <div style={{position:'absolute',left:'-10%',width:'120%',height:180,borderRadius:'50% 50% 0 0',bottom:30,background:'var(--feuille)',opacity:.55}}></div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:52,background:'var(--terre)',borderTop:'6px solid #C0854E'}}></div>

      <main style={{position:'relative', zIndex:2, flex:1, overflow:'hidden'}}>
        <AnimatePresence mode="wait">
          <motion.div
            key={router.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ height: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
