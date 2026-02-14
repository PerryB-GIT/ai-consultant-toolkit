import ProgressBar from '@/components/ProgressBar';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-primary text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Consultant Toolkit</h1>
              <p className="text-gray-400">Get from zero to AI employee in under 60 minutes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Setup Progress</h2>
          <ProgressBar currentStep={1} completedSteps={[]} totalSteps={11} />
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Step 1: Run Setup Script</h2>
          <p className="text-gray-400 mb-6">
            Download and run the setup script for your operating system below. The script will install all required tools and generate a <code className="px-2 py-1 bg-gray-800 rounded text-primary">setup-results.json</code> file automatically.
          </p>

          {/* Download Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a
              href="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/mac/setup-mac.sh"
              download
              className="flex items-center justify-between p-4 bg-background-card border border-gray-800 rounded-lg hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <div>
                  <div className="font-medium text-white">Download for macOS</div>
                  <div className="text-sm text-gray-400">setup-mac.sh</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            <a
              href="https://raw.githubusercontent.com/PerryB-GIT/ai-consultant-toolkit/main/scripts/windows/setup-windows.ps1"
              download
              className="flex items-center justify-between p-4 bg-background-card border border-gray-800 rounded-lg hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-medium text-white">Download for Windows</div>
                  <div className="text-sm text-gray-400">setup-windows.ps1</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>

          {/* Upload Section */}
          <div className="border-t border-gray-800 pt-8">
            <h3 className="text-xl font-bold mb-2">Step 2: Upload Results</h3>
            <p className="text-gray-400 mb-4">
              After running the script, upload the generated <code className="px-2 py-1 bg-gray-800 rounded text-primary">setup-results.json</code> file below.
            </p>
            <FileUpload />
          </div>
        </div>

        {/* Detailed Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-background-card border border-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              macOS Instructions
            </h3>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <div>
                  <div className="font-medium text-white mb-1">Download the script</div>
                  <div>Click the &quot;Download for macOS&quot; button above</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <div>
                  <div className="font-medium text-white mb-1">Open Terminal and run</div>
                  <code className="px-2 py-1 bg-gray-800 rounded text-xs block mt-1">cd ~/Downloads</code>
                  <code className="px-2 py-1 bg-gray-800 rounded text-xs block mt-1">chmod +x setup-mac.sh</code>
                  <code className="px-2 py-1 bg-gray-800 rounded text-xs block mt-1">./setup-mac.sh</code>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <div>
                  <div className="font-medium text-white mb-1">Wait for completion</div>
                  <div className="text-gray-400">Script will install tools and generate results file. This may take 5-10 minutes.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">4.</span>
                <div>
                  <div className="font-medium text-white mb-1">Find the results file</div>
                  <div>Look for <code className="px-1 py-0.5 bg-gray-800 rounded text-xs">~/setup-results.json</code> in your home folder</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">5.</span>
                <div>
                  <div className="font-medium text-white mb-1">Upload it above</div>
                  <div>Drag the file to the upload area</div>
                </div>
              </li>
            </ol>
          </div>

          <div className="p-6 bg-background-card border border-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Windows Instructions
            </h3>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <div>
                  <div className="font-medium text-white mb-1">Download the script</div>
                  <div>Click the &quot;Download for Windows&quot; button above</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <div>
                  <div className="font-medium text-white mb-1">Right-click PowerShell → Run as Administrator</div>
                  <code className="px-2 py-1 bg-gray-800 rounded text-xs block mt-1">cd ~\Downloads</code>
                  <code className="px-2 py-1 bg-gray-800 rounded text-xs block mt-1">Set-ExecutionPolicy Bypass -Scope Process -Force</code>
                  <code className="px-2 py-1 bg-gray-800 rounded text-xs block mt-1">.\setup-windows.ps1</code>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <div>
                  <div className="font-medium text-white mb-1">If restart required (WSL2)</div>
                  <div className="text-gray-400">Script will prompt you to restart. After reboot, run the script again to complete setup and generate results file.</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">4.</span>
                <div>
                  <div className="font-medium text-white mb-1">Find the results file</div>
                  <div>Look for <code className="px-1 py-0.5 bg-gray-800 rounded text-xs">C:\Users\YourName\setup-results.json</code></div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">5.</span>
                <div>
                  <div className="font-medium text-white mb-1">Upload it above</div>
                  <div>Drag the file to the upload area</div>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mt-12 p-6 bg-primary/10 border border-primary rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">What Happens Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">1</div>
              <p className="font-medium text-white mb-1">Validation</p>
              <p>We&apos;ll check that all required tools are installed and properly configured.</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">2</div>
              <p className="font-medium text-white mb-1">Troubleshooting</p>
              <p>If any issues are found, we&apos;ll provide specific fix instructions.</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-2">3</div>
              <p className="font-medium text-white mb-1">Next Steps</p>
              <p>Once validated, we&apos;ll guide you through cloud setup and building your first AI employee.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-background-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-400 text-sm">
          <p>© 2026 Support Forge • AI Consultant Toolkit</p>
          <p className="mt-1">Get your first AI employee operational in under 60 minutes</p>
        </div>
      </footer>
    </div>
  );
}
