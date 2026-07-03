import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, ShieldCheck, X, Award, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Student, useStore } from '../../store/useStore';

interface PaymentReceiptProps {
  student: Student;
  onClose: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ student, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const sendEmail = useStore(state => state.sendEmail);
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const success = await sendEmail(
        student.email || 'a@gmail.com',
        `Matrícula Exitosa - FuturoPro - ${student.fullName}`,
        `¡Bienvenido(a) a FuturoPro!

        Se ha confirmado el pago exitoso de su matrícula para el periodo 2024.

        DATOS DEL ALUMNO:
        - Nombre: ${student.fullName}
        - DNI: ${student.dni}
        - Nivel: ${student.level}
        - Grado: ${student.grade}°

        ACCESO AL PORTAL:
        - Usuario: ${student.username}
        - Contraseña: Su número de DNI

        Atentamente,
        Tesorería de FuturoPro.`
      );
      
      if (success) alert(`✅ Notificación enviada a: ${student.email || 'a@gmail.com'}.`);
    } catch (err) {
      console.error(err);
      alert("Error al procesar el envío.");
    } finally {
      setIsSending(false);
    }
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(style => {
            if (style.innerHTML.includes('oklch')) style.remove();
          });
          const el = clonedDoc.getElementById('pdf-root');
          if (el) el.style.transform = 'none';
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`Comprobante_FuturoPro_${student.dni}.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden">
      {/* Header del Modal */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Comprobante Oficial</h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">FuturoPro Educación</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSendEmail}
            disabled={isSending}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            <Mail size={16} /> {isSending ? 'ENVIANDO...' : 'ENVIAR POR CORREO'}
          </button>
          <button 
            onClick={downloadPDF} 
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Download size={16} /> DESCARGAR PDF
          </button>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Área de Visualización */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center bg-slate-950 custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 0.7 }} 
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'top center' }}
          className="shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
          <div 
            id="pdf-root"
            ref={receiptRef} 
            style={{ 
              width: '210mm',
              height: '297mm',
              backgroundColor: '#ffffff', 
              color: '#0f172a', 
              padding: '50px 70px',
              fontFamily: 'Arial, sans-serif',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: '#4f46e5' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', backgroundColor: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, color: '#4f46e5', letterSpacing: '-1px' }}>FuturoPro</h1>
                  <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>Excelencia Académica</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>COMPROBANTE ELECTRÓNICO</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px 0' }}>N° SERIE: FP-2024-{Math.floor(Math.random() * 9000) + 1000}</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>FECHA: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ height: '2px', background: '#f1f5f9', width: '100%', marginTop: '30px' }}></div>

            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '4px' }}>Constancia de Matrícula</h2>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '30px', opacity: '0.04' }}>
                <Award size={100} />
              </div>
              <h3 style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px' }}>Datos del Alumno</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <p style={{ fontSize: '9px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Nombre</p>
                  <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{student.fullName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>DNI</p>
                  <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{student.dni}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Correo Electrónico</p>
                  <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{student.email || 'a@gmail.com'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '9px', color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Nivel / Grado</p>
                  <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{student.level} - {student.grade}°</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '50px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '12px 20px', borderRadius: '10px', marginBottom: '10px' }}>
                <span style={{ flex: 1, fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Concepto Académico</span>
                <span style={{ width: '100px', textAlign: 'right', fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Monto</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Matrícula Ordinaria Anual</p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Derecho de enseñanza y acceso a laboratorios.</p>
                </div>
                <div style={{ width: '100px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>S/ 450.00</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '30px' }}>
                <div style={{ width: '280px', background: '#eff6ff', padding: '25px', borderRadius: '20px', border: '1px solid #dbeafe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: '#1d4ed8' }}>TOTAL:</span>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: '#1d4ed8' }}>S/ 450.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ width: '150px', height: '1px', background: '#cbd5e1', margin: '0 auto 10px auto' }}></div>
                  <p style={{ fontSize: '11px', fontWeight: 'bold', margin: 0 }}>Tesorería</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 25px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0' }}>
                  <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '900', color: '#166534', margin: 0 }}>PAGO VERIFICADO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
