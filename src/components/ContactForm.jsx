import { useState } from 'react';

export default function ContactForm({ onSubmitFormal }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idea, setIdea] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !idea.trim()) {
      alert('Por favor, completa todos los campos del formulario comercial.');
      return;
    }

    onSubmitFormal({
      name: name.trim(),
      email: email.trim(),
      idea: idea.trim()
    });

    setName('');
    setEmail('');
    setIdea('');
  };

  return (
    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto 20px auto', border: '1px solid #f0f0f0' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Nombre o Empresa:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Correo Electrónico:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Cuéntanos tu idea de App:</label>
          <textarea 
            value={idea} 
            onChange={(e) => setIdea(e.target.value)} 
            rows="4"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', backgroundColor: '#00a650', color: '#fff', padding: '12px', border: 'none', borderRadius: '25px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,166,80,0.2)' }}
        >
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
}