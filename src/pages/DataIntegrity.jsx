import React from 'react';
import ChatInterface from '../components/agents/ChatInterface';
import { ShieldCheck } from 'lucide-react';

export default function DataIntegrityPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Data Integrity Agent</h1>
                        <p className="text-slate-600">Audit your application's data for consistency and fix issues with AI assistance.</p>
                    </div>
                </div>

                <ChatInterface agentName="data_integrity_agent" />
            </div>
        </div>
    );
}