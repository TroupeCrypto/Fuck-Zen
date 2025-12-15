"use client";

import React from "react";
import { Executive } from "../types";

type Props = {
  executives: Executive[];
  onClose: () => void;
};

const KTDConsole: React.FC<Props> = ({ executives, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-cyan-800 rounded-lg shadow-2xl w-[90vw] max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xs uppercase tracking-wide text-cyan-400 border border-cyan-700 px-3 py-1 rounded hover:bg-cyan-900/40"
        >
          Close
        </button>
        <h2 className="text-xl font-black text-white mb-4">Knowledge & Training Department</h2>
        <p className="text-sm text-gray-400 mb-6">
          System console placeholder. Integrations can be wired here to administer modules and exec ingest flows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {executives.map((exec) => (
            <div key={exec.id} className="border border-cyan-900 rounded-lg p-4 bg-cyan-950/20">
              <div className="text-sm font-mono text-cyan-400 mb-1">{exec.id}</div>
              <div className="text-lg font-semibold text-white">{exec.name}</div>
              <div className="text-xs text-gray-500 mt-2">Status: {exec.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KTDConsole;
