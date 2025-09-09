
/**
 * Utility functions for exporting data
 */

/**
 * Converts settings data to CSV format and initiates download
 * @param settingsGroups The settings data to export
 */
export const exportSettingsToCSV = (settingsGroups: any[]): void => {
  // Create CSV header row
  const headers = ["Group", "Setting Name", "Setting Value", "Description"];
  
  // Create CSV content rows
  const rows = settingsGroups.flatMap(group => 
    group.settings.map((setting: any) => [
      group.title,
      setting.name,
      typeof setting.value === 'boolean' ? (setting.value ? "Enabled" : "Disabled") : setting.value,
      setting.description
    ])
  );
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set link attributes
  link.setAttribute('href', url);
  link.setAttribute('download', 'pxmonitor-settings.csv');
  link.style.display = 'none';
  
  // Add to document, trigger download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
