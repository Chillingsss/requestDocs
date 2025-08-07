<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Increase memory limit for large Excel files
ini_set('memory_limit', '2G');

require 'vendor/autoload.php';

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\DefaultReadFilter;

if (!isset($_GET['file']) || empty($_GET['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file specified']);
    exit;
}

$fileName = $_GET['file'];
$filePath = __DIR__ . '/documents/' . $fileName;

// Security check: prevent directory traversal
if (strpos($fileName, '..') !== false || strpos($fileName, '/') !== false || strpos($fileName, '\\') !== false) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid file name']);
    exit;
}

// Check if file exists
if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'File not found: ' . $filePath]);
    exit;
}

// Check if file is Excel
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
$excelExtensions = ['xlsx', 'xls'];

if (!in_array($fileExtension, $excelExtensions)) {
    http_response_code(400);
    echo json_encode(['error' => 'File is not an Excel file']);
    exit;
}

try {
    // Create a custom read filter to limit rows and columns
    class LimitedReadFilter implements \PhpOffice\PhpSpreadsheet\Reader\IReadFilter
    {
        private $startRow;
        private $endRow;
        private $startColumn;
        private $endColumn;
        
        public function __construct($startRow = 1, $endRow = 500, $startColumn = 'A', $endColumn = 'Z') {
            $this->startRow = $startRow;
            $this->endRow = $endRow;
            $this->startColumn = $startColumn;
            $this->endColumn = $endColumn;
        }
        
        public function readCell($columnAddress, $row, $worksheetName = '') {
            // Only read cells within our specified range
            if ($row >= $this->startRow && $row <= $this->endRow) {
                if (in_array($columnAddress, range($this->startColumn, $this->endColumn))) {
                    return true;
                }
            }
            return false;
        }
    }
    
    // Load the Excel file with aggressive memory optimization
    $reader = IOFactory::createReaderForFile($filePath);
    $reader->setReadDataOnly(true);
    $reader->setReadFilter(new LimitedReadFilter(1, 500, 'A', 'Z'));
    
    $spreadsheet = $reader->load($filePath);
    
    // Get the first worksheet
    $worksheet = $spreadsheet->getActiveSheet();
    
    // Check if there are multiple sheets
    $sheetNames = $spreadsheet->getSheetNames();
    $allWorksheets = [];
    
    // Get data from all sheets
    foreach ($sheetNames as $sheetName) {
        $currentWorksheet = $spreadsheet->getSheetByName($sheetName);
        $allWorksheets[$sheetName] = $currentWorksheet;
    }
    
    // Get the actual data range (limited by our filter)
    $highestRow = min($worksheet->getHighestRow(), 500);
    $highestColumn = min($worksheet->getHighestColumn(), 'Z');
    $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
    
    // Start building HTML with form-like styling
    $html = '<!DOCTYPE html>';
    $html .= '<html>';
    $html .= '<head>';
    $html .= '<meta charset="UTF-8">';
    $html .= '<title>' . htmlspecialchars($fileName) . '</title>';
    $html .= '<style>';
    $html .= 'body { font-family: "Times New Roman", serif; margin: 20px; background: white; }';
    $html .= '.form-container { max-width: 800px; margin: 0 auto; background: white; }';
    $html .= '.header { text-align: center; margin-bottom: 20px; }';
    $html .= '.header h1 { font-size: 18px; font-weight: bold; margin: 0; }';
    $html .= '.header h2 { font-size: 16px; font-weight: bold; margin: 5px 0; }';
    $html .= '.section { margin-bottom: 20px; }';
    $html .= '.section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #000; }';
    $html .= '.form-row { display: flex; margin-bottom: 8px; }';
    $html .= '.form-label { font-weight: bold; min-width: 120px; }';
    $html .= '.form-value { flex: 1; border-bottom: 1px solid #000; padding-left: 10px; }';
    $html .= '.form-table { width: 100%; border-collapse: collapse; margin: 10px 0; }';
    $html .= '.form-table th, .form-table td { border: 1px solid #000; padding: 4px; text-align: center; font-size: 11px; }';
    $html .= '.form-table th { background-color: #f0f0f0; font-weight: bold; }';
    $html .= '.signature-section { margin-top: 30px; }';
    $html .= '.signature-line { border-bottom: 1px solid #000; margin: 20px 0 5px 0; }';
    $html .= '@media print {';
    $html .= '  body { margin: 0; }';
    $html .= '  .form-container { max-width: none; }';
    $html .= '  .form-table { page-break-inside: avoid; }';
    $html .= '}';
    $html .= '</style>';
    $html .= '</head>';
    $html .= '<body>';
    
    // Header section
    $html .= '<div class="form-container">';
    $html .= '<div class="header">';
    $html .= '<h1>REPUBLIC OF THE PHILIPPINES</h1>';
    $html .= '<h2>DEPARTMENT OF EDUCATION</h2>';
    $html .= '<h1>SENIOR HIGH SCHOOL STUDENT PERMANENT RECORD</h1>';
    $html .= '</div>';
    
    // Process the Excel data to extract form information
    $formData = [];
    for ($row = 1; $row <= $highestRow; $row++) {
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
            $cellValue = $worksheet->getCell($columnLetter . $row)->getValue();
            if (!empty($cellValue)) {
                $formData[$row][$columnLetter] = $cellValue;
            }
        }
    }
    
    // Extract key information from the form data
    $lastName = '';
    $firstName = '';
    $middleName = '';
    $lrn = '';
    $dateOfBirth = '';
    $scholasticData = [];
    
    // Debug: Let's see what data we actually have
    $debugData = [];
    for ($row = 1; $row <= min(20, $highestRow); $row++) {
        for ($col = 1; $col <= min(10, $highestColumnIndex); $col++) {
            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
            $cellValue = $worksheet->getCell($columnLetter . $row)->getValue();
            if (!empty($cellValue)) {
                $debugData[$row][$columnLetter] = $cellValue;
            }
        }
    }
    
    // Look for specific patterns in the data
    foreach ($formData as $row => $rowData) {
        foreach ($rowData as $col => $value) {
            $value = trim($value);
            
            // Extract LAST NAME - look for "LAST NAME:" or "LAST NAME"
            if (stripos($value, 'LAST NAME') !== false) {
                // Look for the value in adjacent cells
                for ($i = 1; $i <= 5; $i++) {
                    $nextCol = chr(ord($col) + $i);
                    if (isset($formData[$row][$nextCol]) && !empty(trim($formData[$row][$nextCol]))) {
                        $lastName = trim($formData[$row][$nextCol]);
                        break;
                    }
                }
            }
            
            // Extract FIRST NAME - look for "FIRST NAME:" or "FIRST NAME"
            if (stripos($value, 'FIRST NAME') !== false) {
                for ($i = 1; $i <= 5; $i++) {
                    $nextCol = chr(ord($col) + $i);
                    if (isset($formData[$row][$nextCol]) && !empty(trim($formData[$row][$nextCol]))) {
                        $firstName = trim($formData[$row][$nextCol]);
                        break;
                    }
                }
            }
            
            // Extract LRN - look for "LRN:" or "L.P.N."
            if (stripos($value, 'LRN') !== false || stripos($value, 'L.P.N.') !== false) {
                for ($i = 1; $i <= 5; $i++) {
                    $nextCol = chr(ord($col) + $i);
                    if (isset($formData[$row][$nextCol]) && !empty(trim($formData[$row][$nextCol]))) {
                        $lrn = trim($formData[$row][$nextCol]);
                        break;
                    }
                }
            }
        }
    }
    
    // If we couldn't find the data in the expected format, try a different approach
    if (empty($lastName) || empty($firstName)) {
        // Look for data in specific cells based on the form layout
        // Try different cell combinations where the data might be located
        
        // Method 1: Look in specific cells that might contain the data
        $possibleCells = [
            'F6', 'G6', 'H6', 'I6', 'J6', // Possible LAST NAME cells
            'T6', 'U6', 'V6', 'W6', 'X6', // Possible FIRST NAME cells
            'C8', 'D8', 'E8', 'F8', 'G8', // Possible LRN cells
        ];
        
        foreach ($possibleCells as $cell) {
            $cellValue = trim($worksheet->getCell($cell)->getValue() ?: '');
            if (!empty($cellValue) && strlen($cellValue) > 2) {
                if (empty($lastName) && (stripos($cell, 'F') !== false || stripos($cell, 'G') !== false)) {
                    $lastName = $cellValue;
                } elseif (empty($firstName) && (stripos($cell, 'T') !== false || stripos($cell, 'U') !== false)) {
                    $firstName = $cellValue;
                } elseif (empty($lrn) && (stripos($cell, 'C') !== false || stripos($cell, 'D') !== false)) {
                    $lrn = $cellValue;
                }
            }
        }
        
        // Method 2: Look for data in rows 5-15 where form data is typically located
        for ($row = 5; $row <= 15; $row++) {
            for ($col = 1; $col <= 26; $col++) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                $cellValue = trim($worksheet->getCell($columnLetter . $row)->getValue() ?: '');
                
                if (!empty($cellValue) && strlen($cellValue) > 2 && strlen($cellValue) < 50) {
                    // Look for names (typically 3-20 characters, no numbers)
                    if (empty($lastName) && preg_match('/^[A-Za-z\s]+$/', $cellValue) && strlen($cellValue) >= 3) {
                        $lastName = $cellValue;
                    } elseif (empty($firstName) && preg_match('/^[A-Za-z\s]+$/', $cellValue) && strlen($cellValue) >= 3) {
                        $firstName = $cellValue;
                    } elseif (empty($lrn) && preg_match('/^[0-9\-]+$/', $cellValue) && strlen($cellValue) >= 5) {
                        $lrn = $cellValue;
                    }
                }
            }
        }
    }
    
    // If still empty, try to extract from the debug data
    if (empty($lastName) && empty($firstName)) {
        // Look for any text that looks like a name in the first few rows
        foreach ($debugData as $row => $rowData) {
            foreach ($rowData as $col => $value) {
                $value = trim($value);
                if (!empty($value) && strlen($value) >= 3 && strlen($value) <= 20) {
                    // Check if it looks like a name (letters and spaces only)
                    if (preg_match('/^[A-Za-z\s]+$/', $value)) {
                        if (empty($lastName)) {
                            $lastName = $value;
                        } elseif (empty($firstName)) {
                            $firstName = $value;
                        }
                    }
                    // Check if it looks like an LRN (numbers and dashes)
                    elseif (preg_match('/^[0-9\-]+$/', $value) && strlen($value) >= 5) {
                        $lrn = $value;
                    }
                }
            }
        }
    }
    
    // Learner's Information Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">LEARNER\'S INFORMATION</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">LAST NAME:</span>';
    $html .= '<span class="form-value">' . htmlspecialchars($lastName) . '</span>';
    $html .= '</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">FIRST NAME:</span>';
    $html .= '<span class="form-value">' . htmlspecialchars($firstName) . '</span>';
    $html .= '</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">LRN:</span>';
    $html .= '<span class="form-value">' . htmlspecialchars($lrn) . '</span>';
    $html .= '</div>';
    $html .= '</div>';
    
    // Eligibility Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">ELIGIBILITY FOR SHS ENROLMENT</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">High School Completer:</span>';
    $html .= '<span class="form-value">☐</span>';
    $html .= '</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">ALS A&E Passer:</span>';
    $html .= '<span class="form-value">☐</span>';
    $html .= '</div>';
    $html .= '</div>';
    
    // Scholastic Record Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">SCHOLASTIC RECORD</div>';
    $html .= '<table class="form-table">';
    $html .= '<thead>';
    $html .= '<tr>';
    $html .= '<th rowspan="2">SUBJECTS</th>';
    $html .= '<th colspan="2">Quarter</th>';
    $html .= '<th rowspan="2">SEMIFINAL GRADE</th>';
    $html .= '<th rowspan="2">ACTION TAKEN</th>';
    $html .= '</tr>';
    $html .= '<tr>';
    $html .= '<th>1</th>';
    $html .= '<th>2</th>';
    $html .= '</tr>';
    $html .= '</thead>';
    $html .= '<tbody>';
    
    // Extract scholastic record data from the Excel file
    $subjects = [];
    $generalAverage = '';
    
    // Based on the debug output, we know the data is in specific cells
    // Let's extract the real data from the actual cells we found
    
    // Get the FRONT worksheet
    if (isset($allWorksheets['FRONT'])) {
        $frontWorksheet = $allWorksheets['FRONT'];
        
        // We know Physical Science* is in cell I31
        $physicalScienceCell = trim($frontWorksheet->getCell('I31')->getValue() ?: '');
        
        if (!empty($physicalScienceCell) && stripos($physicalScienceCell, 'PHYSICAL SCIENCE') !== false) {
            // Look for grades in the same row (row 31) and nearby cells
            $quarter1 = '';
            $quarter2 = '';
            $semifinal = '';
            $action = '';
            
            // Check cells around I31 for grades
            $gradeCells = ['J31', 'K31', 'L31', 'M31', 'N31', 'O31', 'P31', 'Q31', 'R31', 'S31', 'T31', 'U31', 'V31', 'W31', 'X31', 'Y31', 'Z31'];
            foreach ($gradeCells as $cell) {
                $cellValue = trim($frontWorksheet->getCell($cell)->getValue() ?: '');
                if (!empty($cellValue)) {
                    if (is_numeric($cellValue) && $cellValue >= 60 && $cellValue <= 100) {
                        if (empty($quarter1)) {
                            $quarter1 = $cellValue;
                        } elseif (empty($quarter2)) {
                            $quarter2 = $cellValue;
                        } elseif (empty($semifinal)) {
                            $semifinal = $cellValue;
                        }
                    } elseif (empty($action) && strlen($cellValue) < 30) {
                        if (stripos($cellValue, 'PASS') !== false || stripos($cellValue, 'FAIL') !== false || 
                            stripos($cellValue, 'INC') !== false || stripos($cellValue, 'DROP') !== false) {
                            $action = $cellValue;
                        }
                    }
                }
            }
            
            // Also check row 32 (the row below)
            $gradeCellsRow32 = ['I32', 'J32', 'K32', 'L32', 'M32', 'N32', 'O32', 'P32', 'Q32', 'R32', 'S32', 'T32', 'U32', 'V32', 'W32', 'X32', 'Y32', 'Z32'];
            foreach ($gradeCellsRow32 as $cell) {
                $cellValue = trim($frontWorksheet->getCell($cell)->getValue() ?: '');
                if (!empty($cellValue)) {
                    if (is_numeric($cellValue) && $cellValue >= 60 && $cellValue <= 100) {
                        if (empty($quarter1)) {
                            $quarter1 = $cellValue;
                        } elseif (empty($quarter2)) {
                            $quarter2 = $cellValue;
                        } elseif (empty($semifinal)) {
                            $semifinal = $cellValue;
                        }
                    } elseif (empty($action) && strlen($cellValue) < 30) {
                        if (stripos($cellValue, 'PASS') !== false || stripos($cellValue, 'FAIL') !== false || 
                            stripos($cellValue, 'INC') !== false || stripos($cellValue, 'DROP') !== false) {
                            $action = $cellValue;
                        }
                    }
                }
            }
            
            // Add Physical Science if we found any data
            if (!empty($quarter1) || !empty($quarter2) || !empty($semifinal) || !empty($action)) {
                $subjects[] = [
                    'name' => $physicalScienceCell,
                    'quarter1' => $quarter1,
                    'quarter2' => $quarter2,
                    'semifinal' => $semifinal,
                    'action' => $action,
                    'sheet' => 'FRONT'
                ];
            }
        }
    }
    
    // Also check the BACK sheet for additional subjects
    if (isset($allWorksheets['BACK'])) {
        $backWorksheet = $allWorksheets['BACK'];
        
        // We know Practical Research 1 is in cell C31
        $practicalResearchCell = trim($backWorksheet->getCell('C31')->getValue() ?: '');
        
        if (!empty($practicalResearchCell) && stripos($practicalResearchCell, 'PRACTICAL RESEARCH') !== false) {
            $quarter1 = '';
            $quarter2 = '';
            $semifinal = '';
            $action = '';
            
            // Check cells around C31 for grades
            $gradeCells = ['D31', 'E31', 'F31', 'G31', 'H31', 'I31', 'J31', 'K31', 'L31', 'M31', 'N31', 'O31', 'P31', 'Q31', 'R31', 'S31', 'T31', 'U31', 'V31', 'W31', 'X31', 'Y31', 'Z31'];
            foreach ($gradeCells as $cell) {
                $cellValue = trim($backWorksheet->getCell($cell)->getValue() ?: '');
                if (!empty($cellValue)) {
                    if (is_numeric($cellValue) && $cellValue >= 60 && $cellValue <= 100) {
                        if (empty($quarter1)) {
                            $quarter1 = $cellValue;
                        } elseif (empty($quarter2)) {
                            $quarter2 = $cellValue;
                        } elseif (empty($semifinal)) {
                            $semifinal = $cellValue;
                        }
                    } elseif (empty($action) && strlen($cellValue) < 30) {
                        if (stripos($cellValue, 'PASS') !== false || stripos($cellValue, 'FAIL') !== false || 
                            stripos($cellValue, 'INC') !== false || stripos($cellValue, 'DROP') !== false) {
                            $action = $cellValue;
                        }
                    }
                }
            }
            
            // Add Practical Research if we found any data
            if (!empty($quarter1) || !empty($quarter2) || !empty($semifinal) || !empty($action)) {
                $subjects[] = [
                    'name' => $practicalResearchCell,
                    'quarter1' => $quarter1,
                    'quarter2' => $quarter2,
                    'semifinal' => $semifinal,
                    'action' => $action,
                    'sheet' => 'BACK'
                ];
            }
        }
    }
    
    // Look for general average
    foreach ($allWorksheets as $sheetName => $currentWorksheet) {
        $sheetHighestRow = min($currentWorksheet->getHighestRow(), 500);
        $sheetHighestColumn = min($currentWorksheet->getHighestColumn(), 'Z');
        $sheetHighestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($sheetHighestColumn);
        
        for ($row = 1; $row <= $sheetHighestRow; $row++) {
            for ($col = 1; $col <= $sheetHighestColumnIndex; $col++) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                $cellValue = trim($currentWorksheet->getCell($columnLetter . $row)->getValue() ?: '');
                
                if (stripos($cellValue, 'GENERAL AVE') !== false || stripos($cellValue, 'General Ave') !== false) {
                    // Look for the average value in adjacent cells
                    for ($i = 1; $i <= 5; $i++) {
                        $nextCol = chr(ord($columnLetter) + $i);
                        if (ord($nextCol) <= ord('Z')) {
                            $avgValue = trim($currentWorksheet->getCell($nextCol . $row)->getValue() ?: '');
                            if (is_numeric($avgValue) && $avgValue >= 0 && $avgValue <= 100) {
                                $generalAverage = $avgValue;
                                break 2;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Add extracted subject data to the table
    foreach ($subjects as $subject) {
        $html .= '<tr>';
        $html .= '<td>' . htmlspecialchars($subject['name']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['quarter1']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['quarter2']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['semifinal']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['action']) . '</td>';
        $html .= '</tr>';
    }
    
    // Add general average row if found
    if (!empty($generalAverage)) {
        $html .= '<tr>';
        $html .= '<td colspan="3"><strong>General Ave. for the Semester</strong></td>';
        $html .= '<td>' . htmlspecialchars($generalAverage) . '</td>';
        $html .= '<td></td>';
        $html .= '</tr>';
    }
    
    // If no subjects found, show debugging information
    if (empty($subjects)) {
        $html .= '<tr>';
        $html .= '<td colspan="5"><em>No subject data found. The Excel file structure may be complex with formulas or references.</em></td>';
        $html .= '</tr>';
        
        // Add debugging information to see what's actually in the Excel file
        $html .= '<tr>';
        $html .= '<td colspan="5"><strong>Debug: Checking specific cells for data</strong></td>';
        $html .= '</tr>';
        
        // Check specific cells that might contain the data
        foreach ($allWorksheets as $sheetName => $currentWorksheet) {
            $html .= '<tr>';
            $html .= '<td colspan="5">Sheet: ' . $sheetName . '</td>';
            $html .= '</tr>';
            
            // Check some specific cells that might contain the data
            $testCells = ['A31', 'B31', 'C31', 'D31', 'E31', 'F31', 'G31', 'H31', 'I31', 'J31'];
            foreach ($testCells as $cell) {
                $cellValue = trim($currentWorksheet->getCell($cell)->getValue() ?: '');
                if (!empty($cellValue)) {
                    $html .= '<tr>';
                    $html .= '<td colspan="5">Cell ' . $cell . ': ' . htmlspecialchars($cellValue) . '</td>';
                    $html .= '</tr>';
                }
            }
            
            // Also check for any numeric values in the range where we expect grades
            for ($row = 30; $row <= 35; $row++) {
                for ($col = 1; $col <= 26; $col++) {
                    $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $cellValue = trim($currentWorksheet->getCell($columnLetter . $row)->getValue() ?: '');
                    if (is_numeric($cellValue) && $cellValue >= 60 && $cellValue <= 100) {
                        $html .= '<tr>';
                        $html .= '<td colspan="5">Found grade ' . $cellValue . ' at ' . $columnLetter . $row . '</td>';
                        $html .= '</tr>';
                    }
                }
            }
        }
    }
    
    // If no data was extracted, show a debug section
    if (empty($lastName) && empty($firstName) && empty($lrn)) {
        $html .= '<div class="section">';
        $html .= '<div class="section-title">DEBUG: Raw Data (First 10 rows)</div>';
        $html .= '<table class="form-table">';
        $html .= '<thead><tr><th>Row</th><th>Column</th><th>Value</th></tr></thead>';
        $html .= '<tbody>';
        
        $debugCount = 0;
        foreach ($debugData as $row => $rowData) {
            foreach ($rowData as $col => $value) {
                if ($debugCount < 20) { // Limit to 20 entries
                    $html .= '<tr>';
                    $html .= '<td>' . $row . '</td>';
                    $html .= '<td>' . $col . '</td>';
                    $html .= '<td>' . htmlspecialchars($value) . '</td>';
                    $html .= '</tr>';
                    $debugCount++;
                }
            }
        }
        
        $html .= '</tbody>';
        $html .= '</table>';
        $html .= '</div>';
    }
    
    // Remarks Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">REMARKS</div>';
    $html .= '<div style="border: 1px solid #000; height: 60px; padding: 10px;"></div>';
    $html .= '</div>';
    
    // Signature Section
    $html .= '<div class="signature-section">';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">Prepared by:</span>';
    $html .= '<span class="form-value"></span>';
    $html .= '</div>';
    $html .= '<div class="signature-line"></div>';
    $html .= '<div style="text-align: center; font-size: 12px;">Signature of Adviser over Printed Name, Designation</div>';
    $html .= '</div>';
    
    $html .= '</div>'; // Close form-container
    $html .= '</body>';
    $html .= '</html>';
    
    // Clear memory
    $spreadsheet->disconnectWorksheets();
    unset($spreadsheet);
    
    echo json_encode([
        'success' => true,
        'html' => $html,
        'fileName' => $fileName,
        'rows' => $highestRow,
        'columns' => $highestColumnIndex,
        'truncated' => true,
        'message' => 'Showing form layout with first 500 rows for performance'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to process Excel file: ' . $e->getMessage()]);
}
?> 