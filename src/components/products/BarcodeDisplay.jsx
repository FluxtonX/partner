import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

// Simple Code 128 barcode generator
function generateCode128Bars(text) {
  // Code 128 character set
  const code128 = {
    ' ': [2,1,2,2,2,2], '!': [2,2,2,1,2,2], '"': [2,2,2,2,2,1],
    '#': [1,2,1,2,2,3], '$': [1,2,1,3,2,2], '%': [1,3,1,2,2,2],
    '&': [1,2,2,2,1,3], "'": [1,2,2,3,1,2], '(': [1,3,2,2,1,2],
    ')': [2,2,1,2,1,3], '*': [2,2,1,3,1,2], '+': [2,3,1,2,1,2],
    ',': [1,1,2,2,3,2], '-': [1,2,2,1,3,2], '.': [1,2,2,2,3,1],
    '/': [1,1,3,2,2,2], '0': [1,2,3,1,2,2], '1': [1,2,3,2,2,1],
    '2': [1,1,2,3,2,2], '3': [1,2,2,3,2,1], '4': [1,2,2,1,2,3],
    '5': [1,3,2,1,2,2], '6': [1,2,1,3,2,2], '7': [1,2,1,2,3,2],
    '8': [1,2,1,2,2,3], '9': [1,3,1,2,2,2], ':': [2,2,1,1,3,2],
    ';': [2,2,1,2,3,1], '<': [2,1,3,2,1,2], '=': [2,2,3,1,1,2],
    '>': [2,2,1,1,2,3], '?': [2,3,1,1,2,2], '@': [1,1,2,1,3,3],
    'A': [1,3,2,1,3,1], 'B': [1,1,3,1,2,3], 'C': [1,3,1,1,2,3],
    'D': [1,1,2,3,1,3], 'E': [1,3,1,3,1,2], 'F': [3,1,3,1,2,1],
    'G': [2,1,1,3,1,3], 'H': [2,3,1,1,1,3], 'I': [2,1,3,1,1,3],
    'J': [2,1,1,1,3,3], 'K': [2,1,3,3,1,1], 'L': [2,3,3,1,1,1],
    'M': [1,1,2,1,2,4], 'N': [1,1,2,4,2,1], 'O': [1,4,2,1,2,1],
    'P': [1,1,3,1,1,4], 'Q': [1,1,4,1,1,3], 'R': [1,4,1,1,1,3],
    'S': [1,1,1,4,1,3], 'T': [1,1,1,3,1,4], 'U': [1,4,1,1,3,1],
    'V': [1,1,3,1,4,1], 'W': [1,1,4,1,3,1], 'X': [3,1,1,1,4,1],
    'Y': [1,1,1,1,4,3], 'Z': [1,1,1,3,4,1], '[': [1,1,1,1,3,4],
    '\\': [1,4,1,1,1,3], ']': [1,4,1,3,1,1], '^': [1,1,1,4,3,1],
    '_': [1,1,3,4,1,1], '`': [3,1,1,4,1,1], 'a': [1,1,4,3,1,1],
    'b': [4,1,1,1,1,3], 'c': [4,1,1,3,1,1], 'd': [1,1,1,1,4,3],
    'e': [1,1,1,3,4,1], 'f': [1,3,1,1,4,1], 'g': [1,1,4,1,3,1],
    'h': [3,1,1,1,4,1], 'i': [4,1,1,1,3,1], 'j': [2,1,1,4,1,2],
    'k': [2,1,1,2,1,4], 'l': [2,1,1,2,4,1], 'm': [2,4,1,2,1,1],
    'n': [2,2,1,1,1,4], 'o': [4,3,1,1,1,1], 'p': [1,1,1,2,2,4],
    'q': [1,1,1,4,2,2], 'r': [1,2,1,1,2,4], 's': [1,2,1,4,2,1],
    't': [1,4,1,2,2,1], 'u': [1,1,2,2,1,4], 'v': [1,1,2,4,1,2],
    'w': [1,2,2,1,1,4], 'x': [1,2,2,4,1,1], 'y': [1,4,2,1,1,2],
    'z': [1,4,2,2,1,1], '{': [2,4,1,2,1,1], '|': [2,2,1,1,1,4],
    '}': [4,1,3,1,1,1], '~': [2,4,1,1,1,2]
  };

  // Start and stop patterns
  const startB = [2,1,1,4,1,2];
  const stop = [2,3,3,1,1,1,2];
  
  let bars = [...startB];
  let checksum = 104; // Start B value
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (code128[char]) {
      bars.push(...code128[char]);
      checksum += (char.charCodeAt(0) - 32) * (i + 1);
    }
  }
  
  // Add checksum character
  const checksumChar = String.fromCharCode((checksum % 103) + 32);
  if (code128[checksumChar]) {
    bars.push(...code128[checksumChar]);
  }
  
  bars.push(...stop);
  return bars;
}

export default function BarcodeDisplay({ barcode, size = 'medium' }) {
  const canvasRef = useRef(null);
  
  const sizes = {
    small: { width: 200, height: 60, scale: 1 },
    medium: { width: 300, height: 80, scale: 1.5 },
    large: { width: 400, height: 100, scale: 2 }
  };
  
  const { width, height, scale } = sizes[size] || sizes.medium;

  useEffect(() => {
    if (!barcode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    try {
      const bars = generateCode128Bars(barcode);
      const barWidth = Math.max(1, Math.floor((width - 40) / bars.reduce((a, b) => a + b, 0)));
      
      let x = 20;
      ctx.fillStyle = 'black';
      
      for (let i = 0; i < bars.length; i++) {
        const barThickness = bars[i] * barWidth;
        if (i % 2 === 0) { // Black bars
          ctx.fillRect(x, 10, barThickness, height - 30);
        }
        x += barThickness;
      }
      
      // Add text below barcode
      ctx.fillStyle = 'black';
      ctx.font = `${Math.floor(12 * scale)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(barcode, width / 2, height - 5);
      
    } catch (error) {
      // Fallback to text display
      ctx.fillStyle = 'black';
      ctx.font = `${Math.floor(16 * scale)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(barcode || 'NO BARCODE', width / 2, height / 2);
    }
  }, [barcode, width, height, scale]);

  const copyBarcode = () => {
    if (barcode) {
      navigator.clipboard.writeText(barcode);
    }
  };

  const downloadBarcode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `barcode-${barcode}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!barcode) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-md p-4 text-gray-500">
        No barcode generated
      </div>
    );
  }

  return (
    <Card className="p-4 bg-white">
      <div className="flex flex-col items-center space-y-2">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-200 rounded"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyBarcode}>
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadBarcode}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
}