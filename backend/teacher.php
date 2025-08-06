<?php
include "headers.php";

class User {

  function getStudent()
  {
    include "connection.php";

    $sql = "SELECT a.id, a.firstname, a.middlename, a.lastname, a.lrn, a.email, a.password, a.userLevel, a.birthDate, a.age, a.religion, a.completeAddress, a.fatherName, a.motherName, a.guardianName, a.guardianRelationship, a.sectionId, a.schoolyearId, b.name as sectionName, s.name as strand, t.name as track, a.strandId, sy.year as schoolYear
    FROM tblstudent a
    LEFT JOIN tblsection b ON a.sectionId = b.id
    LEFT JOIN tblstrand s ON a.strandId = s.id
    LEFT JOIN tbltrack t ON s.trackId = t.id
    LEFT JOIN tblschoolyear sy ON a.schoolyearId = sy.id";
    $stmt = $conn->prepare($sql); 
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($students);
    }
    return json_encode([]);
  }

  function getStudentRecords()
  {
    include "connection.php";

    // Get teacher's grade level and section from request
    $teacherGradeLevelId = isset($_POST["teacherGradeLevelId"]) ? $_POST["teacherGradeLevelId"] : null;
    $teacherSectionId = isset($_POST["teacherSectionId"]) ? $_POST["teacherSectionId"] : null;

    $sql = "SELECT 
              a.id, 
              a.firstname, 
              a.lastname, 
              a.lrn,
              a.email, 
              b.fileName, 
              c.name as teacherGradeLevel,
              d.name as sectionName,
              e.name as sectionGradeLevel,
              f.name as actualTeacherGradeLevel,
              b.gradeLevelId as sfGradeLevelId,
              g.name as sfGradeLevelName
            FROM tblstudent a 
            LEFT JOIN tblsfrecord b ON a.id = b.studentId
            LEFT JOIN tblgradelevel c ON b.gradeLevelId = c.id
            INNER JOIN tblsection d ON a.sectionId = d.id
            LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
            LEFT JOIN tblgradelevel f ON f.id = :teacherGradeLevelId
            LEFT JOIN tblgradelevel g ON b.gradeLevelId = g.id
            WHERE 1=1";

    // Add grade level filter if teacher's grade level is provided
    // Only show students who are in sections of the teacher's grade level
    if ($teacherGradeLevelId) {
      $sql .= " AND d.gradeLevelId = :teacherGradeLevelId";
    }

    // Add section filter if teacher's section is provided
    if ($teacherSectionId) {
      $sql .= " AND d.id = :teacherSectionId";
    }

    $sql .= " ORDER BY a.lastname, a.firstname, b.gradeLevelId";
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameters if provided
    if ($teacherGradeLevelId) {
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
    }
    if ($teacherSectionId) {
      $stmt->bindParam(':teacherSectionId', $teacherSectionId);
    }
    
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($students);
    }
    return json_encode([]);
  }

  function getSectionsByGradeLevel()
  {
    include "connection.php";

    // Get teacher's grade level and section from request
    $teacherGradeLevelId = isset($_POST["teacherGradeLevelId"]) ? $_POST["teacherGradeLevelId"] : null;
    $teacherSectionId = isset($_POST["teacherSectionId"]) ? (int)$_POST["teacherSectionId"] : null;

    // Debug logging
    error_log("Debug - teacherGradeLevelId: " . $teacherGradeLevelId);
    error_log("Debug - teacherSectionId: " . $teacherSectionId);
    error_log("Debug - teacherSectionId type: " . gettype($teacherSectionId));

    // If teacher has a specific section assigned, only return that section
    if ($teacherSectionId && $teacherSectionId > 0) {
      $sql = "SELECT DISTINCT 
                d.name as sectionName, 
                e.name as sectionGradeLevel,
                f.name as actualTeacherGradeLevel
              FROM tblsection d 
              LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
              LEFT JOIN tblgradelevel f ON f.id = :teacherGradeLevelId
              WHERE d.id = :teacherSectionId";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
      $stmt->bindParam(':teacherSectionId', $teacherSectionId);
    } else {
      // If no specific section assigned, return all sections of the teacher's grade level
      $sql = "SELECT DISTINCT 
                d.name as sectionName, 
                e.name as sectionGradeLevel,
                f.name as actualTeacherGradeLevel
              FROM tblsection d 
              LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
              LEFT JOIN tblgradelevel f ON f.id = :teacherGradeLevelId
              WHERE d.gradeLevelId = :teacherGradeLevelId";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
    }

    $sql .= " ORDER BY d.name";
    
    error_log("Debug - SQL Query: " . $sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      error_log("Debug - Sections found: " . json_encode($sections));
      return json_encode($sections);
    }
    error_log("Debug - No sections found");
    return json_encode([]);
  }

  function getAvailableSections()
  {
    include "connection.php";

    $gradeLevelId = isset($_POST["gradeLevelId"]) ? $_POST["gradeLevelId"] : null;

    if (!$gradeLevelId) {
      return json_encode(['success' => false, 'error' => 'Grade level ID is required']);
    }

    $sql = "SELECT id, name FROM tblsection WHERE gradeLevelId = :gradeLevelId ORDER BY name";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':gradeLevelId', $gradeLevelId);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode(['success' => true, 'sections' => $sections]);
    }
    return json_encode(['success' => true, 'sections' => []]);
  }

  function updateStudentSection()
  {
    include "connection.php";

    try {
      $studentId = $_POST['studentId'];
      $newSectionId = $_POST['newSectionId'];

      if (!$studentId || !$newSectionId) {
        return json_encode(['success' => false, 'error' => 'Student ID and Section ID are required']);
      }

      // Get the current user ID from session or request
      $userId = isset($_POST['userId']) ? $_POST['userId'] : null;
      
      // Start transaction
      $conn->beginTransaction();

      try {
        // Update the student's section
        $sql = "UPDATE tblstudent SET sectionId = :newSectionId WHERE id = :studentId";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':newSectionId', $newSectionId);
        $stmt->bindParam(':studentId', $studentId);
        $stmt->execute();

        // Get the grade level of the new section
        $gradeLevelSql = "SELECT gradeLevelId FROM tblsection WHERE id = :sectionId";
        $gradeLevelStmt = $conn->prepare($gradeLevelSql);
        $gradeLevelStmt->bindParam(':sectionId', $newSectionId);
        $gradeLevelStmt->execute();
        $gradeLevelResult = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
        
        $gradeLevelId = $gradeLevelResult ? $gradeLevelResult['gradeLevelId'] : null;

        // If enrolling to Grade 12 (gradeLevelId = 2), insert a record in tblsfrecord
        if ($gradeLevelId == 2) {
          // Always insert a new record for Grade 12 (don't update existing)
          $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, userId, createdAt) 
                        VALUES (:studentId, NULL, :gradeLevelId, :userId, NOW())";
          $insertStmt = $conn->prepare($insertSql);
          $insertStmt->bindParam(':studentId', $studentId);
          $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
          $insertStmt->bindParam(':userId', $userId);
          $insertStmt->execute();
        }

        // Commit transaction
        $conn->commit();
        
        return json_encode(['success' => true, 'message' => 'Student section updated successfully']);
      } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
      }
    } catch (Exception $e) {
      return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }

  function updateMultipleStudentSections()
  {
    include "connection.php";

    try {
      $studentIds = json_decode($_POST['studentIds'], true);
      $newSectionId = $_POST['newSectionId'];

      if (!$studentIds || !$newSectionId) {
        return json_encode(['success' => false, 'error' => 'Student IDs and Section ID are required']);
      }

      // Get the current user ID from session or request
      $userId = isset($_POST['userId']) ? $_POST['userId'] : null;

      // Get the grade level of the new section
      $gradeLevelSql = "SELECT gradeLevelId FROM tblsection WHERE id = :sectionId";
      $gradeLevelStmt = $conn->prepare($gradeLevelSql);
      $gradeLevelStmt->bindParam(':sectionId', $newSectionId);
      $gradeLevelStmt->execute();
      $gradeLevelResult = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
      
      $gradeLevelId = $gradeLevelResult ? $gradeLevelResult['gradeLevelId'] : null;

      $successCount = 0;
      $errorCount = 0;

      // Start transaction
      $conn->beginTransaction();

      try {
        foreach ($studentIds as $studentId) {
          // Update the student's section
          $sql = "UPDATE tblstudent SET sectionId = :newSectionId WHERE id = :studentId";
          $stmt = $conn->prepare($sql);
          $stmt->bindParam(':newSectionId', $newSectionId);
          $stmt->bindParam(':studentId', $studentId);
          
          if ($stmt->execute()) {
            // If enrolling to Grade 12 (gradeLevelId = 2), insert a record in tblsfrecord
            if ($gradeLevelId == 2) {
              // Always insert a new record for Grade 12 (don't update existing)
              $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, userId, createdAt) 
                            VALUES (:studentId, NULL, :gradeLevelId, :userId, NOW())";
              $insertStmt = $conn->prepare($insertSql);
              $insertStmt->bindParam(':studentId', $studentId);
              $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
              $insertStmt->bindParam(':userId', $userId);
              $insertStmt->execute();
            }
            $successCount++;
          } else {
            $errorCount++;
          }
        }

        // Commit transaction
        $conn->commit();

        return json_encode([
          'success' => true, 
          'message' => "Updated $successCount students successfully",
          'successCount' => $successCount,
          'errorCount' => $errorCount
        ]);
      } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
      }
    } catch (Exception $e) {
      return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }

  function updateStudentFile()
  {
    include "connection.php";

    try {
      // Check if file was uploaded
      if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        return json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
      }

      $studentId = $_POST['studentId'];
      $gradeLevelId = isset($_POST['gradeLevelId']) ? $_POST['gradeLevelId'] : null; // New parameter
      $uploadedFile = $_FILES['file'];

      // Validate file type (only Excel files)
      $allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      $fileExtension = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
      $allowedExtensions = ['xlsx', 'xls'];

      if (!in_array($fileExtension, $allowedExtensions)) {
        return json_encode(['success' => false, 'error' => 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed.']);
      }

      // Check file size (max 10MB)
      if ($uploadedFile['size'] > 10 * 1024 * 1024) {
        return json_encode(['success' => false, 'error' => 'File size too large. Maximum size is 10MB.']);
      }

      // Create documents directory if it doesn't exist
      $uploadDir = 'documents/';
      if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      // Use the original filename
      $fileName = $uploadedFile['name'];
      $filePath = $uploadDir . $fileName;

      // Check if a file with the same name already exists and delete it
      if (file_exists($filePath)) {
        unlink($filePath); // Delete the existing file
      }

      // Move uploaded file
      if (move_uploaded_file($uploadedFile['tmp_name'], $filePath)) {
        // If gradeLevelId is provided, use it; otherwise, get the teacher's grade level
        if (!$gradeLevelId) {
          // Get the teacher's grade level ID for this student
          $gradeLevelSql = "SELECT b.gradeLevelId 
                            FROM tblstudent a 
                            LEFT JOIN tblsfrecord b ON a.id = b.studentId 
                            WHERE a.id = :studentId 
                            LIMIT 1";
          $gradeLevelStmt = $conn->prepare($gradeLevelSql);
          $gradeLevelStmt->bindParam(':studentId', $studentId);
          $gradeLevelStmt->execute();
          $gradeLevelResult = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
          
          $gradeLevelId = $gradeLevelResult ? $gradeLevelResult['gradeLevelId'] : null;
        }

        // Check if record already exists for this specific grade level
        $checkSql = "SELECT id FROM tblsfrecord WHERE studentId = :studentId AND gradeLevelId = :gradeLevelId";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':studentId', $studentId);
        $checkStmt->bindParam(':gradeLevelId', $gradeLevelId);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
          // Update existing record for this grade level
          $updateSql = "UPDATE tblsfrecord SET fileName = :fileName WHERE studentId = :studentId AND gradeLevelId = :gradeLevelId";
          $updateStmt = $conn->prepare($updateSql);
          $updateStmt->bindParam(':fileName', $fileName);
          $updateStmt->bindParam(':studentId', $studentId);
          $updateStmt->bindParam(':gradeLevelId', $gradeLevelId);
          
          if ($updateStmt->execute()) {
            // If this is Grade 12 (gradeLevelId = 2), also handle Excel upload to tblstudentdocument
            if ($gradeLevelId == 2) {
              $excelResult = $this->handleExcelUploadToStudentDocument($conn, $studentId, $fileName);
              if (!$excelResult['success']) {
                // Log the error but don't fail the main operation
                error_log("Excel upload to student document failed: " . $excelResult['error']);
              }
            }
            
            return json_encode(['success' => true, 'message' => 'SF10 file updated successfully']);
          } else {
            return json_encode(['success' => false, 'error' => 'Failed to update database record']);
          }
        } else {
          // Insert new record for this grade level
          $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, createdAt) 
                        VALUES (:studentId, :fileName, :gradeLevelId, NOW())";
          $insertStmt = $conn->prepare($insertSql);
          $insertStmt->bindParam(':studentId', $studentId);
          $insertStmt->bindParam(':fileName', $fileName);
          $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
          
          if ($insertStmt->execute()) {
            // If this is Grade 12 (gradeLevelId = 2), also handle Excel upload to tblstudentdocument
            if ($gradeLevelId == 2) {
              $excelResult = $this->handleExcelUploadToStudentDocument($conn, $studentId, $fileName);
              if (!$excelResult['success']) {
                // Log the error but don't fail the main operation
                error_log("Excel upload to student document failed: " . $excelResult['error']);
              }
            }
            
            return json_encode(['success' => true, 'message' => 'SF10 file uploaded successfully']);
          } else {
            return json_encode(['success' => false, 'error' => 'Failed to insert database record']);
          }
        }
      } else {
        return json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
      }

    } catch (Exception $e) {
      return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }

  /**
   * Handle Excel upload to tblstudentdocument for Grade 12 students
   */
  private function handleExcelUploadToStudentDocument($conn, $studentId, $excelFileName)
  {
    try {
      // The Excel file was already uploaded and saved, so we just need to insert/update the record
      // Get the SF10 document ID (assuming it's ID 5 based on the database dump)
      $documentId = 5; // SF10 document type

      // Get current user ID
      $userId = isset($_POST['userId']) ? $_POST['userId'] : null;

      // Check if record already exists in tblstudentdocument
      $checkSql = "SELECT id FROM tblstudentdocument WHERE studentId = :studentId AND documentId = :documentId";
      $checkStmt = $conn->prepare($checkSql);
      $checkStmt->bindParam(':studentId', $studentId);
      $checkStmt->bindParam(':documentId', $documentId);
      $checkStmt->execute();

      if ($checkStmt->rowCount() > 0) {
        // Update existing record
        $updateSql = "UPDATE tblstudentdocument SET fileName = :fileName, userId = :userId, createdAt = NOW() 
                      WHERE studentId = :studentId AND documentId = :documentId";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bindParam(':fileName', $excelFileName);
        $updateStmt->bindParam(':userId', $userId);
        $updateStmt->bindParam(':studentId', $studentId);
        $updateStmt->bindParam(':documentId', $documentId);
        
        if ($updateStmt->execute()) {
          return ['success' => true, 'message' => 'Excel document updated successfully'];
        } else {
          return ['success' => false, 'error' => 'Failed to update Excel document record'];
        }
      } else {
        // Insert new record
        $insertSql = "INSERT INTO tblstudentdocument (studentId, fileName, documentId, userId, createdAt) 
                      VALUES (:studentId, :fileName, :documentId, :userId, NOW())";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bindParam(':studentId', $studentId);
        $insertStmt->bindParam(':fileName', $excelFileName);
        $insertStmt->bindParam(':documentId', $documentId);
        $insertStmt->bindParam(':userId', $userId);
        
        if ($insertStmt->execute()) {
          return ['success' => true, 'message' => 'Excel document uploaded successfully'];
        } else {
          return ['success' => false, 'error' => 'Failed to insert Excel document record'];
        }
      }

    } catch (Exception $e) {
      return ['success' => false, 'error' => 'Excel upload error: ' . $e->getMessage()];
    }
  }
    
}

$operation = isset($_POST["operation"]) ? $_POST["operation"] : "0";
$json = isset($_POST["json"]) ? $_POST["json"] : "0";

$user = new User();

switch ($operation) {
  case "getStudentRecords":
    echo $user->getStudentRecords();
    break;
  case "getStudent":
    echo $user->getStudent();
    break;
  case "getSectionsByGradeLevel":
    echo $user->getSectionsByGradeLevel();
    break;
  case "getAvailableSections":
    echo $user->getAvailableSections();
    break;
  case "updateStudentSection":
    echo $user->updateStudentSection();
    break;
  case "updateMultipleStudentSections":
    echo $user->updateMultipleStudentSections();
    break;
  case "updateStudentFile":
    echo $user->updateStudentFile();
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>