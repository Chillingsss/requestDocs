<?php
include "headers.php";

class User {

  function getStudent()
  {
    include "connection.php";

    $sql = "SELECT a.id, a.firstname, a.middlename, a.lastname, a.lrn, a.email, a.password, a.userLevel, a.track, a.strand, a.birthDate, a.age, a.religion, a.completeAddress, a.fatherName, a.motherName, a.guardianName, a.guardianRelationship, a.sectionId, b.name
    FROM tblstudent a
    INNER JOIN tblsection b ON a.sectionId = b.id";
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

    // Get teacher's grade level from request
    $teacherGradeLevelId = isset($_POST["teacherGradeLevelId"]) ? $_POST["teacherGradeLevelId"] : null;

    $sql = "SELECT 
              a.id, 
              a.firstname, 
              a.lastname, 
              a.lrn,
              a.email, 
              b.fileName, 
              c.name as teacherGradeLevel,
              d.name as sectionName,
              e.name as sectionGradeLevel
            FROM tblstudent a 
            LEFT JOIN tblsfrecord b ON a.id = b.studentId
            LEFT JOIN tblgradelevel c ON b.gradeLevelId = c.id
            INNER JOIN tblsection d ON a.sectionId = d.id
            LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
            WHERE 1=1";

    // Add grade level filter if teacher's grade level is provided
    if ($teacherGradeLevelId) {
      $sql .= " AND (b.gradeLevelId = :teacherGradeLevelId OR d.gradeLevelId = :teacherGradeLevelId)";
    }

    $sql .= " ORDER BY a.lastname, a.firstname";
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameter if provided
    if ($teacherGradeLevelId) {
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
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

    // Get teacher's grade level from request
    $teacherGradeLevelId = isset($_POST["teacherGradeLevelId"]) ? $_POST["teacherGradeLevelId"] : null;

    $sql = "SELECT DISTINCT 
              d.name as sectionName, 
              c.name as teacherGradeLevel,
              e.name as sectionGradeLevel
            FROM tblstudent a 
            LEFT JOIN tblsfrecord b ON a.id = b.studentId
            LEFT JOIN tblgradelevel c ON b.gradeLevelId = c.id
            INNER JOIN tblsection d ON a.sectionId = d.id
            LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
            WHERE (c.name IS NOT NULL OR e.name IS NOT NULL)";

    // Add grade level filter if teacher's grade level is provided
    if ($teacherGradeLevelId) {
      $sql .= " AND (b.gradeLevelId = :teacherGradeLevelId OR d.gradeLevelId = :teacherGradeLevelId)";
    }

    $sql .= " ORDER BY COALESCE(c.name, e.name), d.name";
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameter if provided
    if ($teacherGradeLevelId) {
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
    }
    
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($sections);
    }
    return json_encode([]);
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

        // Check if record already exists
        $checkSql = "SELECT id FROM tblsfrecord WHERE studentId = :studentId";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':studentId', $studentId);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
          // Update existing record
          $updateSql = "UPDATE tblsfrecord SET fileName = :fileName WHERE studentId = :studentId";
          $updateStmt = $conn->prepare($updateSql);
          $updateStmt->bindParam(':fileName', $fileName);
          $updateStmt->bindParam(':studentId', $studentId);
          
          if ($updateStmt->execute()) {
            return json_encode(['success' => true, 'message' => 'SF10 file updated successfully']);
          } else {
            return json_encode(['success' => false, 'error' => 'Failed to update database record']);
          }
        } else {
          // Insert new record
          $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, createdAt) 
                        VALUES (:studentId, :fileName, :gradeLevelId, NOW())";
          $insertStmt = $conn->prepare($insertSql);
          $insertStmt->bindParam(':studentId', $studentId);
          $insertStmt->bindParam(':fileName', $fileName);
          $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
          
          if ($insertStmt->execute()) {
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
  case "updateStudentFile":
    echo $user->updateStudentFile();
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>