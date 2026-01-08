'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Download, Upload, FileText } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface ExportImportSectionProps {
  menuItems: MenuItem[];
  onImport: (items: { name: string; price: number }[], mode: 'append' | 'replace') => Promise<void>;
}

export default function ExportImportSection({ menuItems, onImport }: ExportImportSectionProps) {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export handlers
  const handleExportJSON = () => {
    if (!menuItems || menuItems.length === 0) {
      alert('Tidak ada item menu untuk diekspor');
      return;
    }

    const exportData = menuItems.map(item => ({
      name: item.name,
      price: item.price,
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `menu-items-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setIsExportDropdownOpen(false);
  };

  const handleExportCSV = () => {
    if (!menuItems || menuItems.length === 0) {
      alert('Tidak ada item menu untuk diekspor');
      return;
    }

    const csvContent = [
      ['Nama', 'Harga'].join(','),
      ...menuItems.map(item => [item.name, item.price].join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);

    const exportFileDefaultName = `menu-items-${new Date().toISOString().split('T')[0]}.csv`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    setIsExportDropdownOpen(false);
  };

  // Import handlers
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.indexOf('nama') !== -1 ? headers.indexOf('nama') : headers.indexOf('name');
    const priceIndex = headers.indexOf('harga') !== -1 ? headers.indexOf('harga') : headers.indexOf('price');

    if (nameIndex === -1 || priceIndex === -1) {
      throw new Error('CSV harus memiliki kolom "nama" dan "harga"');
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const name = values[nameIndex]?.replace(/"/g, '');
      const priceStr = values[priceIndex]?.replace(/"/g, '');
      const price = parseFloat(priceStr);

      if (!name || name.length === 0) {
        throw new Error(`Baris ${index + 2}: Nama tidak boleh kosong`);
      }
      if (isNaN(price) || price <= 0) {
        throw new Error(`Baris ${index + 2}: Harga harus berupa angka positif`);
      }

      return { name, price };
    });
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Pilih file untuk diimpor');
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      let menuItems: { name: string; price: number }[] = [];

      if (importFile.name.toLowerCase().endsWith('.json')) {
        menuItems = JSON.parse(fileContent);
        if (!Array.isArray(menuItems)) {
          throw new Error('Format JSON tidak valid. Harus berupa array objek');
        }
      } else if (importFile.name.toLowerCase().endsWith('.csv')) {
        menuItems = parseCSV(fileContent);
      } else {
        throw new Error('Format file tidak didukung. Gunakan JSON atau CSV');
      }

      if (menuItems.length === 0) {
        throw new Error('Tidak ada item menu yang valid untuk diimpor');
      }

      // Validate each item
      for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
          throw new Error(`Item ${i + 1}: Nama tidak valid`);
        }
        if (!item.price || typeof item.price !== 'number' || item.price <= 0) {
          throw new Error(`Item ${i + 1}: Harga harus berupa angka positif`);
        }
      }

      await onImport(menuItems, importMode);

      setIsImportOpen(false);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Gagal mengimpor: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  // Close export dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExportDropdownOpen && !(event.target as Element).closest('.export-dropdown')) {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExportDropdownOpen]);

  return (
    <div className="flex gap-2">
      {/* Export Dropdown */}
      <div className="relative export-dropdown">
        <Button
          variant="outline"
          onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        {isExportDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
            <button
              onClick={handleExportJSON}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
          </div>
        )}
      </div>

      {/* Import Button */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Item Menu</DialogTitle>
            <DialogDescription>
              Import item menu dari file JSON atau CSV. Format yang didukung: JSON array objek atau CSV dengan kolom &quot;nama&quot; dan &quot;harga&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mode Import</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={(e) => setImportMode(e.target.value as 'append')}
                    className="mr-2"
                  />
                  Tambahkan ke menu yang ada
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={(e) => setImportMode(e.target.value as 'replace')}
                    className="mr-2"
                  />
                  Ganti semua menu
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">File Import</label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: JSON (array objek) atau CSV (kolom: nama, harga)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Batal</Button>
            <Button onClick={handleImport} disabled={!importFile || isImporting}>
              {isImporting ? 'Mengimpor...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}