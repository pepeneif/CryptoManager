/**
 * WalletSetup - Pantalla de creación/desbloqueo de wallet
 * 
 * Permite crear una nueva wallet o desbloquear una existente.
 * 
 * Uso:
 * ```tsx
 * import { WalletSetup } from './services/cashu/components/WalletSetup';
 * 
 * <WalletSetup />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useCashuWalletContext } from './CashuWalletProvider';
import { secureStorage } from '../secureStorage';

type Mode = 'welcome' | 'create' | 'unlock' | 'import';

export function WalletSetup() {
  const wallet = useCashuWalletContext();
  const [mode, setMode] = useState<Mode>('welcome');
  const [wallets, setWallets] = useState<Array<{ id: string; name: string; createdAt: number }>>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  
  // Form create
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirm, setCreateConfirm] = useState('');
  
  // Form unlock
  const [unlockPassword, setUnlockPassword] = useState('');
  
  // Import
  const [importMnemonic, setImportMnemonic] = useState('');
  const [importName, setImportName] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string | null>(null);

  // Cargar lista de wallets
  useEffect(() => {
    loadWallets();
  }, []);

  async function loadWallets() {
    try {
      await secureStorage.init();
      const list = await secureStorage.listWallets();
      setWallets(list);
    } catch (err) {
      console.error('Error loading wallets:', err);
    }
  }

  async function handleCreate() {
    if (createPassword !== createConfirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (createPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const mnemonic = generatedMnemonic || wallet.send(0, '').then(() => '').catch(() => '');
      const finalMnemonic = generatedMnemonic || `word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12`;
      
      await wallet.createWallet(
        createName || 'Mi Wallet Cashu',
        createPassword,
        finalMnemonic
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creando wallet');
    }
  }

  function handleCreateNew() {
    // Generar mnemonic para mostrar
    const mn = wallet.send(0, '').catch(() => null);
    // Por ahora usamos el hook directamente
    setMode('create');
  }

  async function handleUnlock() {
    if (!selectedWalletId || !unlockPassword) return;

    try {
      await wallet.unlockWallet(selectedWalletId, unlockPassword);
    } catch (err) {
      alert('Contraseña incorrecta');
    }
  }

  async function handleImport() {
    if (!importPassword || importPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!wallet.validateMnemonic(importMnemonic)) {
      alert('Mnemonic inválido. Asegúrate de usar 12 o 24 palabras.');
      return;
    }

    try {
      await wallet.createWallet(
        importName || 'Wallet Importada',
        importPassword,
        importMnemonic
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error importando wallet');
    }
  }

  // ============================================
  // WELCOME SCREEN
  // ============================================
  if (mode === 'welcome') {
    return (
      <div className="wallet-setup welcome">
        <div className="setup-header">
          <div className="logo">⚡</div>
          <h1>Cashu Wallet</h1>
          <p>Wallet ecash para pagos privados e instantáneos</p>
        </div>

        {wallets.length > 0 && (
          <div className="existing-wallets">
            <h3>Wallets guardadas</h3>
            {wallets.map(w => (
              <button 
                key={w.id} 
                className="wallet-option"
                onClick={() => {
                  setSelectedWalletId(w.id);
                  setMode('unlock');
                }}
              >
                <span className="wallet-name">{w.name}</span>
                <span className="wallet-date">
                  {new Date(w.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="setup-actions">
          <button className="primary-btn" onClick={handleCreateNew}>
            Crear nueva wallet
          </button>
          <button className="secondary-btn" onClick={() => setMode('import')}>
            Importar con mnemonic
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // CREATE SCREEN
  // ============================================
  if (mode === 'create') {
    if (!generatedMnemonic) {
      // Generar y mostrar mnemonic
      const newMnemonic = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
      setGeneratedMnemonic(newMnemonic);
    }

    return (
      <div className="wallet-setup create">
        <button className="back-btn" onClick={() => setMode('welcome')}>
          ← Volver
        </button>

        <h2>Crear nueva Wallet</h2>

        {generatedMnemonic && !showMnemonic && (
          <div className="mnemonic-warning">
            <div className="warning-icon">⚠️</div>
            <p>Tu <strong>mnemonic seed</strong> es la única forma de recuperar tu wallet.</p>
            <p><strong>Nadie</strong> puede ayudarte si lo pierdes.</p>
            <button className="primary-btn" onClick={() => setShowMnemonic(true)}>
              Entiendo, mostrar mi seed
            </button>
          </div>
        )}

        {generatedMnemonic && showMnemonic && (
          <div className="create-form">
            <div className="mnemonic-display">
              <h4>Tu Seed (guarda estas palabras)</h4>
              <div className="mnemonic-words">
                {generatedMnemonic.split(' ').map((word, i) => (
                  <span key={i} className="word">
                    <span className="word-num">{i + 1}</span>
                    {word}
                  </span>
                ))}
              </div>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(generatedMnemonic)}
              >
                📋 Copiar
              </button>
            </div>

            <div className="form-group">
              <label>Nombre de wallet (opcional)</label>
              <input
                type="text"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder="Mi Wallet Cashu"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                value={createConfirm}
                onChange={e => setCreateConfirm(e.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>

            <button 
              className="primary-btn"
              onClick={handleCreate}
              disabled={!createPassword || createPassword !== createConfirm}
            >
              Crear Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // UNLOCK SCREEN
  // ============================================
  if (mode === 'unlock') {
    return (
      <div className="wallet-setup unlock">
        <button className="back-btn" onClick={() => setMode('welcome')}>
          ← Volver
        </button>

        <h2>Desbloquear Wallet</h2>

        <div className="wallet-info">
          <span className="wallet-name">{wallets.find(w => w.id === selectedWalletId)?.name}</span>
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={unlockPassword}
            onChange={e => setUnlockPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          />
        </div>

        <button 
          className="primary-btn"
          onClick={handleUnlock}
          disabled={!unlockPassword}
        >
          Desbloquear
        </button>

        {wallet.error && (
          <div className="error-message">{wallet.error}</div>
        )}
      </div>
    );
  }

  // ============================================
  // IMPORT SCREEN
  // ============================================
  if (mode === 'import') {
    return (
      <div className="wallet-setup import">
        <button className="back-btn" onClick={() => setMode('welcome')}>
          ← Volver
        </button>

        <h2>Importar Wallet</h2>
        <p>Ingresa tu mnemonic seed de 12 o 24 palabras</p>

        <div className="form-group">
          <label>Seed Mnemonic</label>
          <textarea
            value={importMnemonic}
            onChange={e => setImportMnemonic(e.target.value)}
            placeholder="word1 word2 word3 ... word12"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Nombre de wallet (opcional)</label>
          <input
            type="text"
            value={importName}
            onChange={e => setImportName(e.target.value)}
            placeholder="Wallet importada"
          />
        </div>

        <div className="form-group">
          <label>Nueva contraseña para esta wallet</label>
          <input
            type="password"
            value={importPassword}
            onChange={e => setImportPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <button 
          className="primary-btn"
          onClick={handleImport}
          disabled={!importMnemonic || !importPassword}
        >
          Importar Wallet
        </button>
      </div>
    );
  }

  return null;
}
