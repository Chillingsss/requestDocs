<?php
include "headers.php";

class User {
  function GetDocuments()
  {
    include "connection.php";

    $sql = "SELECT * FROM tbldocument";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $cashMethod = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($cashMethod);
    }
    return json_encode([]);
  }

  function getUserRequests($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];

    try {
      $sql = "SELECT 
                r.id,
                d.name as document,
                r.purpose,
                DATE(r.createdAt) as dateRequested,
                s.name as status,
                s.id as statusId
              FROM tblrequest r
              INNER JOIN tbldocument d ON r.documentId = d.id
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              WHERE r.studentId = :userId
              AND rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )
              ORDER BY r.createdAt DESC";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $userId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($requests);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getAllRequests()
  {
    include "connection.php";

    try {
      $sql = "SELECT 
                r.id,
                CONCAT(u.firstname, ' ', u.lastname) as student,
                d.name as document,
                r.purpose,
                DATE(r.createdAt) as dateRequested,
                s.name as status,
                s.id as statusId
              FROM tblrequest r
              INNER JOIN tbldocument d ON r.documentId = d.id
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              INNER JOIN tblstudent u ON r.studentId = u.id
              WHERE rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )
              ORDER BY r.createdAt DESC
              LIMIT 20";

      $stmt = $conn->prepare($sql);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($requests);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getRequestStats()
  {
    include "connection.php";

    try {
      $sql = "SELECT 
                s.name as status,
                COUNT(DISTINCT r.id) as count,
                COUNT(CASE WHEN DATE(r.createdAt) = CURDATE() THEN 1 END) as todayCount
              FROM tblrequest r
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              WHERE rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )
              GROUP BY s.id, s.name";

      $stmt = $conn->prepare($sql);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($stats);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function processRequest($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];
    
    // Set Philippine timezone and get current datetime
    date_default_timezone_set('Asia/Manila');
    $datetime = date('Y-m-d h:i:s A');

    try {
      $conn->beginTransaction();

      // First, get the current status of the request
      $currentStatusSql = "SELECT s.id as statusId, s.name as statusName
                          FROM tblrequeststatus rs
                          INNER JOIN tblstatus s ON rs.statusId = s.id
                          WHERE rs.requestId = :requestId
                          ORDER BY rs.id DESC
                          LIMIT 1";
      
      $currentStatusStmt = $conn->prepare($currentStatusSql);
      $currentStatusStmt->bindParam(':requestId', $requestId);
      $currentStatusStmt->execute();
      
      if ($currentStatusStmt->rowCount() == 0) {
        $conn->rollBack();
        return json_encode(['error' => 'Request not found']);
      }
      
      $currentStatus = $currentStatusStmt->fetch(PDO::FETCH_ASSOC);
      $currentStatusId = $currentStatus['statusId'];
      
      // Determine next status based on current status
      $nextStatusId = null;
      $actionMessage = '';
      
      switch ($currentStatusId) {
        case 1: // Pending -> Processed
          $nextStatusId = 2;
          $actionMessage = 'Request processed successfully';
          break;
        case 2: // Processed -> Signatory
          $nextStatusId = 3;
          $actionMessage = 'Request sent to signatory successfully';
          break;
        case 3: // Signatory -> Release
          $nextStatusId = 4;
          $actionMessage = 'Request release successfully';
          break;
        case 4: // Release -> Completed
          $nextStatusId = 5;
          $actionMessage = 'Document completed successfully';
          break;
        default:
          $conn->rollBack();
          return json_encode(['error' => 'Invalid status transition']);
      }

      // Insert new status record
      $sql = "INSERT INTO tblrequeststatus (requestId, statusId, createdAt) VALUES (:requestId, :statusId, :datetime)";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->bindParam(':statusId', $nextStatusId);
      $stmt->bindParam(':datetime', $datetime);

      if ($stmt->execute()) {
        $conn->commit();
        return json_encode(['success' => true, 'message' => $actionMessage, 'newStatusId' => $nextStatusId]);
      } else {
        $conn->rollBack();
        return json_encode(['error' => 'Failed to process request: ' . implode(" ", $stmt->errorInfo())]);
      }

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getRequestAttachments($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      $sql = "SELECT 
                req.filepath,
                rt.nameType as requirementType,
                req.createdAt
              FROM tblrequirements req
              LEFT JOIN tblrequirementstype rt ON req.typeId = rt.id
              WHERE req.requestId = :requestId 
              ORDER BY req.createdAt ASC";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $attachments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Filter attachments to only include those that actually exist in the filesystem
        $validAttachments = [];
        foreach ($attachments as $attachment) {
          $filePath = __DIR__ . '/requirements/' . $attachment['filepath'];
          if (file_exists($filePath)) {
            $validAttachments[] = $attachment;
          }
        }
        
        return json_encode($validAttachments);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getStudentDocuments($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      // First get the student ID and document ID from the request
      $studentSql = "SELECT r.studentId, r.documentId, d.name as requestedDocumentType 
                     FROM tblrequest r
                     INNER JOIN tbldocument d ON r.documentId = d.id
                     WHERE r.id = :requestId";
      $studentStmt = $conn->prepare($studentSql);
      $studentStmt->bindParam(':requestId', $requestId);
      $studentStmt->execute();
      
      if ($studentStmt->rowCount() == 0) {
        return json_encode(['error' => 'Request not found']);
      }
      
      $requestData = $studentStmt->fetch(PDO::FETCH_ASSOC);
      $studentId = $requestData['studentId'];
      $documentId = $requestData['documentId'];

      // Get student documents that match the requested document type only, including grade level information
      $sql = "SELECT 
                sd.id,
                sd.documentId,
                sd.fileName,
                sd.createdAt,
                sd.gradeLevelId,
                d.name as documentType,
                gl.name as gradeLevelName
              FROM tblstudentdocument sd
              LEFT JOIN tbldocument d ON sd.documentId = d.id
              LEFT JOIN tblgradelevel gl ON sd.gradeLevelId = gl.id
              WHERE sd.studentId = :studentId 
              AND sd.documentId = :documentId
              ORDER BY sd.gradeLevelId ASC, sd.createdAt DESC";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':studentId', $studentId);
      $stmt->bindParam(':documentId', $documentId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Filter documents to only include those that actually exist in the filesystem
        $validDocuments = [];
        foreach ($documents as $document) {
          $filePath = __DIR__ . '/documents/' . $document['fileName'];
          if (file_exists($filePath)) {
            $validDocuments[] = $document;
          }
        }
        
        return json_encode($validDocuments);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getStudentInfo($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      // Get student information from the request
      $sql = "SELECT 
                s.id,
                s.firstname,
                s.middlename,
                s.lastname,
                s.lrn,
                s.strandId,
                st.name as strand,
                t.name as track,
                s.email
              FROM tblrequest r
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblstrand st ON s.strandId = st.id
              LEFT JOIN tbltrack t ON st.trackId = t.id
              WHERE r.id = :requestId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $studentInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        return json_encode($studentInfo);
      }
      
      return json_encode(['error' => 'Student not found']);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function updateStudentInfo($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];
    $lrn = $json['lrn'];
    $strandId = $json['strandId'];
    $firstname = $json['firstname'];
    $middlename = $json['middlename'];
    $lastname = $json['lastname'];

    try {
      // First get the student ID from the request
      $getStudentSql = "SELECT studentId FROM tblrequest WHERE id = :requestId";
      $getStudentStmt = $conn->prepare($getStudentSql);
      $getStudentStmt->bindParam(':requestId', $requestId);
      $getStudentStmt->execute();
      
      if ($getStudentStmt->rowCount() == 0) {
        return json_encode(['error' => 'Request not found']);
      }
      
      $studentData = $getStudentStmt->fetch(PDO::FETCH_ASSOC);
      $studentId = $studentData['studentId'];

      // Update student information (firstname, middlename, lastname, lrn, strandId)
      $sql = "UPDATE tblstudent 
              SET firstname = :firstname, middlename = :middlename, lastname = :lastname, lrn = :lrn, strandId = :strandId 
              WHERE id = :studentId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':firstname', $firstname);
      $stmt->bindParam(':middlename', $middlename);
      $stmt->bindParam(':lastname', $lastname);
      $stmt->bindParam(':lrn', $lrn);
      $stmt->bindParam(':strandId', $strandId);
      $stmt->bindParam(':studentId', $studentId);

      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Student information updated successfully']);
      } else {
        return json_encode(['error' => 'Failed to update student information']);
      }

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getSection()
  {
    include "connection.php";

    $sql = "SELECT * FROM tblsection";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($sections);
    }
    return json_encode([]);
  }

  function getSchoolYear()
  {
    include "connection.php";

    $sql = "SELECT * FROM tblschoolyear";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $schoolYears = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($schoolYears);
    }
    return json_encode([]);
  }

  function getDocumentAllStudent(){
    include "connection.php";

    $sql = "SELECT a.fileName, a.gradeLevelId, b.name as documentType, c.firstname, c.lastname, c.middlename, c.lrn, c.track, c.strand, gl.name as gradeLevelName FROM tblstudentdocument a 
    INNER JOIN tbldocument b ON a.documentId = b.id
    INNER JOIN tblstudent c ON a.studentId = c.id
    LEFT JOIN tblgradelevel gl ON a.gradeLevelId = gl.id
    ORDER BY a.gradeLevelId ASC, c.lastname ASC, c.firstname ASC
    ";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($sections);
    }
    return json_encode([]);
  }

  function uploadStudentDocuments() {
    include "connection.php";
    try {
      $documentType = $_POST['documentType'];
      $uploadDir = 'documents/';
      if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      $results = [
        'success' => true,
        'totalProcessed' => 0,
        'successfulAssignments' => 0,
        'failedAssignments' => 0,
        'details' => []
      ];

      if (isset($_FILES['documents']) && isset($_POST['studentIds'])) {
        $fileCount = count($_FILES['documents']['name']);
        $studentIds = $_POST['studentIds'];

        for ($i = 0; $i < $fileCount; $i++) {
          if ($_FILES['documents']['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
          }
          $fileName = $_FILES['documents']['name'][$i];
          $fileTmpName = $_FILES['documents']['tmp_name'][$i];
          $fileSize = $_FILES['documents']['size'][$i];
          $studentId = $studentIds[$i];

          // Validate file type
          $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
          if (strtolower($fileExtension) !== 'pdf') {
            $results['details'][] = [
              'fileName' => $fileName,
              'success' => false,
              'reason' => 'Invalid file type. Only PDF files are allowed.'
            ];
            continue;
          }
          // Check file size (max 10MB)
          if ($fileSize > 10 * 1024 * 1024) {
            $results['details'][] = [
              'fileName' => $fileName,
              'success' => false,
              'reason' => 'File size too large. Maximum size is 10MB.'
            ];
            continue;
          }
          // Generate unique filename
          $uniqueFileName = time() . '_' . $fileName;
          $filePath = $uploadDir . $uniqueFileName;

          if (move_uploaded_file($fileTmpName, $filePath)) {
            $results['totalProcessed']++;
            
            // Get student's current grade level
            $gradeLevelSql = "SELECT s.gradeLevelId FROM tblstudent s WHERE s.id = :studentId";
            $gradeLevelStmt = $conn->prepare($gradeLevelSql);
            $gradeLevelStmt->bindParam(':studentId', $studentId);
            $gradeLevelStmt->execute();
            
            $gradeLevelId = 1; // Default to Grade 11 if not found
            if ($gradeLevelStmt->rowCount() > 0) {
              $studentData = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
              $gradeLevelId = $studentData['gradeLevelId'] ?? 1;
            }
            
            // Insert document record with grade level
            $insertSql = "INSERT INTO tblstudentdocument (studentId, documentId, fileName, gradeLevelId, createdAt) 
                         VALUES (:studentId, :documentId, :fileName, :gradeLevelId, NOW())";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bindParam(':studentId', $studentId);
            $insertStmt->bindParam(':documentId', $documentType);
            $insertStmt->bindParam(':fileName', $uniqueFileName);
            $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);

            if ($insertStmt->execute()) {
              $results['successfulAssignments']++;
              $results['details'][] = [
                'fileName' => $fileName,
                'success' => true,
                'studentId' => $studentId,
                'gradeLevelId' => $gradeLevelId
              ];
            } else {
              $results['failedAssignments']++;
              $results['details'][] = [
                'fileName' => $fileName,
                'success' => false,
                'reason' => 'Database error while saving document record'
              ];
              unlink($filePath);
            }
          } else {
            $results['details'][] = [
              'fileName' => $fileName,
              'success' => false,
              'reason' => 'Failed to upload file to server'
            ];
          }
        }
      }

      return json_encode($results);

    } catch (Exception $e) {
      return json_encode([
        'success' => false,
        'message' => 'Upload failed: ' . $e->getMessage()
      ]);
    }
  }

  function getStrands() {
    include "connection.php";
    $sql = "SELECT s.id, s.name, t.id as trackId, t.name as trackName FROM tblstrand s INNER JOIN tbltrack t ON s.trackId = t.id";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
      $strands = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($strands);
    }
    return json_encode([]);
  }
  
  function getSf10DocumentId() {
    include "connection.php";
    
    try {
      $sql = "SELECT id FROM tbldocument WHERE name = 'SF10' LIMIT 1";
      $stmt = $conn->prepare($sql);
      $stmt->execute();
      
      if ($stmt->rowCount() > 0) {
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return json_encode(['success' => true, 'documentId' => $result['id']]);
      }
      
      return json_encode(['success' => false, 'error' => 'SF10 document not found']);
    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }

  function addIndividualStudent() {
    include "connection.php";
    
    try {
      // Get student data
      $studentData = json_decode($_POST['studentData'], true);
      $documentId = $_POST['documentId'];
      
      // Validate required fields
      $requiredFields = ['firstname', 'lastname', 'lrn', 'password', 'strandId', 'schoolYearId', 'gradeLevelId'];
      foreach ($requiredFields as $field) {
        if (empty($studentData[$field])) {
          return json_encode(['error' => "Missing required field: $field"]);
        }
      }
      
      if (!isset($_FILES['sf10File']) || $_FILES['sf10File']['error'] !== UPLOAD_ERR_OK) {
        return json_encode(['error' => 'SF10 file is required']);
      }
      
      $sf10File = $_FILES['sf10File'];
      
      // Validate file type
      if ($sf10File['type'] !== 'application/pdf') {
        return json_encode(['error' => 'Only PDF files are allowed for SF10']);
      }
      
      // Check file size (max 10MB)
      if ($sf10File['size'] > 10 * 1024 * 1024) {
        return json_encode(['error' => 'File size too large. Maximum size is 10MB.']);
      }
      
      $conn->beginTransaction();
      
      // Use the gradeLevelId directly from frontend for sectionId
      $sectionId = $studentData['gradeLevelId'];
      
      // Use original filename for SF10
      $fileName = $sf10File['name'];
      $uploadPath = 'documents/' . $fileName;
      
      // Move uploaded file
      if (!move_uploaded_file($sf10File['tmp_name'], $uploadPath)) {
        $conn->rollBack();
        return json_encode(['error' => 'Failed to upload SF10 file']);
      }
      
      // Generate email from LRN
      $email = null;
      
      // Insert student record with all required fields
      $insertStudentSql = "INSERT INTO tblstudent (
        id, firstname, middlename, lastname, email, password, userLevel, 
        lrn, strandId, sectionId, schoolyearId, createdAt, updatedAt
      ) VALUES (
        :lrn, :firstname, :middlename, :lastname, :email, :password, :userLevel,
        :lrn, :strandId, :sectionId, :schoolyearId, NOW(), NOW()
      )";
      
      $insertStudentStmt = $conn->prepare($insertStudentSql);
      $insertStudentStmt->bindParam(':lrn', $studentData['lrn']);
      $insertStudentStmt->bindParam(':firstname', $studentData['firstname']);
      $insertStudentStmt->bindParam(':middlename', $studentData['middlename']);
      $insertStudentStmt->bindParam(':lastname', $studentData['lastname']);
      $insertStudentStmt->bindParam(':email', $email);
      $insertStudentStmt->bindParam(':password', password_hash($studentData['password'], PASSWORD_DEFAULT));
      $insertStudentStmt->bindParam(':userLevel', $studentData['userLevel']);
      $insertStudentStmt->bindParam(':strandId', $studentData['strandId']);
      $insertStudentStmt->bindParam(':sectionId', $sectionId);
      $insertStudentStmt->bindParam(':schoolyearId', $studentData['schoolYearId']);
      
      if (!$insertStudentStmt->execute()) {
        $conn->rollBack();
        unlink($uploadPath); // Remove uploaded file
        $errorInfo = $insertStudentStmt->errorInfo();
        return json_encode([
          'error' => 'Failed to insert student record: ' . implode(" ", $errorInfo),
          'details' => [
            'sql' => $insertStudentSql,
            'data' => $studentData,
            'errorInfo' => $errorInfo
          ]
        ]);
      }
      
      // Insert SF10 document record
      $insertDocumentSql = "INSERT INTO tblstudentdocument (
        studentId, documentId, fileName, gradeLevelId, createdAt
      ) VALUES (
        :studentId, :documentId, :fileName, :gradeLevelId, NOW()
      )";
      
      $insertDocumentStmt = $conn->prepare($insertDocumentSql);
      $insertDocumentStmt->bindParam(':studentId', $studentData['lrn']);
      $insertDocumentStmt->bindParam(':documentId', $documentId);
      $insertDocumentStmt->bindParam(':fileName', $fileName);
      $insertDocumentStmt->bindParam(':gradeLevelId', $studentData['gradeLevelId']);
      
      if (!$insertDocumentStmt->execute()) {
        $conn->rollBack();
        unlink($uploadPath); // Remove uploaded file
        $documentErrorInfo = $insertDocumentStmt->errorInfo();
        return json_encode(['error' => 'Failed to insert document record: ' . implode(" ", $documentErrorInfo)]);
      }
      
      $conn->commit();
      
      return json_encode([
        'success' => true,
        'message' => 'Student added successfully with SF10 document',
        'studentId' => $studentData['lrn'],
        'fileName' => $fileName
      ]);
      
    } catch (Exception $e) {
      if (isset($conn)) {
        $conn->rollBack();
      }
      if (isset($uploadPath) && file_exists($uploadPath)) {
        unlink($uploadPath);
      }
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

}

$operation = isset($_POST["operation"]) ? $_POST["operation"] : "0";
$json = isset($_POST["json"]) ? $_POST["json"] : "0";

$user = new User();

switch ($operation) {
  case "GetDocuments":
    echo $user->GetDocuments();
    break;
  case "getUserRequests":
    echo $user->getUserRequests($json);
    break;
  case "getAllRequests":
    echo $user->getAllRequests();
    break;
  case "getRequestStats":
    echo $user->getRequestStats();
    break;
  case "processRequest":
    echo $user->processRequest($json);
    break;
  case "getRequestAttachments":
    echo $user->getRequestAttachments($json);
    break;
  case "getStudentDocuments":
    echo $user->getStudentDocuments($json);
    break;
  case "getStudentInfo":
    echo $user->getStudentInfo($json);
    break;
  case "updateStudentInfo":
    echo $user->updateStudentInfo($json);
    break;
  case "getSection":
    echo $user->getSection();
    break;
  case "getSchoolYear":
    echo $user->getSchoolYear();
    break;
  case "getDocumentAllStudent":
    echo $user->getDocumentAllStudent();
    break;
  case "uploadStudentDocuments":
    echo $user->uploadStudentDocuments();
    break;
  case "getStrands":
    echo $user->getStrands();
    break;
  case "getSf10DocumentId":
    echo $user->getSf10DocumentId();
    break;
  case "addIndividualStudent":
    echo $user->addIndividualStudent();
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>