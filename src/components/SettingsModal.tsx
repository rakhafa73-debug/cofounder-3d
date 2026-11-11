import React from 'react';
import { 
  X, Settings, Globe, Palette, Volume2, 
  AlertOctagon, CheckCircle2, Shield, RefreshCw
} from 'lucide-react';
import { OfficeSettings } from '../types';
import { playSound } from '../three/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OfficeSettings;
  onUpdateSettings: (newSettings: Partial<OfficeSettings>) => void;
  onEmergencyStop: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onEmergencyStop,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D1222] border border-white/15 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Company & System Settings</h2>
              <p className="text-xs text-slate-400">Configure language, 3D graphics, and emergency controls</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center space-x-3">
              <Globe className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Interface Language</div>
                <div className="text-[11px] text-slate-400">Switch between English and Bahasa Indonesia</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => {
                  onUpdateSettings({ language: 'en' });
                  playSound.click();
                }}
                className={`px-3 py-1 rounded font-semibold transition ${
                  settings.language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  onUpdateSettings({ language: 'id' });
                  playSound.click();
                }}
                className={`px-3 py-1 rounded font-semibold transition ${
                  settings.language === 'id' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Indonesia
              </button>
            </div>
          </div>

          {/* 3D Theme */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center space-x-3">
              <Palette className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs font-bold text-white">3D Office Aesthetics</div>
                <div className="text-[11px] text-slate-400">PBR visual styling and lighting rig</div>
              </div>
            </div>
            <select
              value={settings.theme3D}
              onChange={(e) => {
                onUpdateSettings({ theme3D: e.target.value as any });
                playSound.click();
              }}
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="cyber_dark">Cyber Dark</option>
              <option value="neon_dawn">Neon Dawn</option>
              <option value="corporate_slate">Corporate Slate</option>
            </select>
          </div>

          {/* Sound FX */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">Procedural Web Audio FX</div>
                <div className="text-[11px] text-slate-400">Keyboard typing and boardroom chimes</div>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdateSettings({ soundEnabled: !settings.soundEnabled });
                playSound.click();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-500 border-white/10'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Emergency Stop Guardrail (Mandated by Requirement 19) */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <AlertOctagon className="w-4 h-4" />
              <span>Executive Emergency Stop Button</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Immediately halts all running agent task queues, cancels pending tool invocations, and puts the C-suite into standby mode.
            </p>
            <button
              onClick={() => {
                onEmergencyStop();
                playSound.click();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/30"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Engage Emergency Stop</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
          <span>COFOUNDER 3D · Version 1.0.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
