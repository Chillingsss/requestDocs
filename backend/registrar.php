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
                s.id as statusId,
                CASE 
                  WHEN r.purpose IS NOT NULL THEN r.purpose
                  WHEN EXISTS (SELECT 1 FROM tblrequestpurpose rp WHERE rp.requestId = r.id) THEN 
                    (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') 
                     FROM tblrequestpurpose rp 
                     INNER JOIN tblpurpose p ON rp.purposeId = p.id 
                     WHERE rp.requestId = r.id)
                  ELSE 'No purpose specified'
                END as displayPurpose
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
                s.id as statusId,
                CASE 
                  WHEN r.purpose IS NOT NULL THEN r.purpose
                  WHEN EXISTS (SELECT 1 FROM tblrequestpurpose rp WHERE rp.requestId = r.id) THEN 
                    (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') 
                     FROM tblrequestpurpose rp 
                     INNER JOIN tblpurpose p ON rp.purposeId = p.id 
                     WHERE rp.requestId = r.id)
                  ELSE 'No purpose specified'
                END as displayPurpose
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
        case 3: // Signatory -> Ready for Release (don't change status yet)
          $nextStatusId = 3; // Keep same status
          $actionMessage = 'Request ready for release scheduling';
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
      // First get the student ID, document ID, and student's current grade level directly from tblstudent
      $studentSql = "SELECT r.studentId, r.documentId, d.name as requestedDocumentType, s.gradeLevelId as currentGradeLevelId
                     FROM tblrequest r
                     INNER JOIN tbldocument d ON r.documentId = d.id
                     INNER JOIN tblstudent s ON r.studentId = s.id
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
      $currentGradeLevelId = $requestData['currentGradeLevelId'];

      // Check if this is an SF10 document request
      $isSf10Request = strtolower($requestData['requestedDocumentType']) === 'sf10';

      // Build the SQL query based on document type
      if ($isSf10Request) {
        // For SF10 documents, show documents that match the student's current grade level
        // If currentGradeLevelId is null, show all SF10 documents for this student
        if ($currentGradeLevelId) {
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
                  AND sd.gradeLevelId = :currentGradeLevelId
                  ORDER BY sd.id DESC";
        } else {
          // If student doesn't have a grade level set, show all SF10 documents
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
        }
      } else {
        // For other document types, show all documents of that type
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
      }
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':studentId', $studentId);
      $stmt->bindParam(':documentId', $documentId);
      
      if ($isSf10Request && $currentGradeLevelId) {
        $stmt->bindParam(':currentGradeLevelId', $currentGradeLevelId);
      }
      
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

  function debugStudentGradeLevel($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      // Debug query to see student and document grade levels using correct relationships
      $sql = "SELECT 
                r.id as requestId,
                r.studentId,
                s.sectionId,
                sec.gradeLevelId as studentGradeLevel,
                gl.name as studentGradeLevelName,
                d.name as requestedDocument,
                GROUP_CONCAT(DISTINCT sd.gradeLevelId) as documentGradeLevels,
                GROUP_CONCAT(DISTINCT sd.fileName) as documentFiles
              FROM tblrequest r
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblgradelevel gl ON sec.gradeLevelId = gl.id
              INNER JOIN tbldocument d ON r.documentId = d.id
              LEFT JOIN tblstudentdocument sd ON sd.studentId = s.id AND sd.documentId = d.id
              WHERE r.id = :requestId
              GROUP BY r.id";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $debugInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        return json_encode($debugInfo);
      }
      
      return json_encode(['error' => 'Request not found']);

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
      // Get student information from the request including grade level through section
      $sql = "SELECT 
                s.id,
                s.firstname,
                s.middlename,
                s.lastname,
                s.lrn,
                s.strandId,
                st.name as strand,
                t.name as track,
                s.email,
                sec.gradeLevelId,
                gl.name as gradeLevel
              FROM tblrequest r
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblstrand st ON s.strandId = st.id
              LEFT JOIN tbltrack t ON st.trackId = t.id
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblgradelevel gl ON sec.gradeLevelId = gl.id
              WHERE r.id = :requestId ORDER BY s.createdAt ASC";
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
      $userId = $_POST['userId'];
      // Validate required fields (sectionId is optional)
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
      
      // Use provided sectionId from frontend if present; otherwise set to NULL
      $sectionId = (isset($studentData['sectionId']) && $studentData['sectionId'] !== '') ? $studentData['sectionId'] : null;
      
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
        lrn, strandId, sectionId, schoolyearId, gradeLevelId, createdAt, updatedAt
      ) VALUES (
        :lrn, :firstname, :middlename, :lastname, :email, :password, :userLevel,
        :lrn, :strandId, :sectionId, :schoolyearId, :gradeLevelId, NOW(), NOW()
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
      if ($sectionId === null) {
        $insertStudentStmt->bindValue(':sectionId', null, PDO::PARAM_NULL);
      } else {
        $insertStudentStmt->bindParam(':sectionId', $sectionId);
      }
      $insertStudentStmt->bindParam(':schoolyearId', $studentData['schoolYearId']);
      $insertStudentStmt->bindParam(':gradeLevelId', $studentData['gradeLevelId']);
      
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
        studentId, documentId, fileName, gradeLevelId, createdAt, userId
      ) VALUES (
        :studentId, :documentId, :fileName, :gradeLevelId, NOW(), :userId
      )";
      
      $insertDocumentStmt = $conn->prepare($insertDocumentSql);
      $insertDocumentStmt->bindParam(':studentId', $studentData['lrn']);
      $insertDocumentStmt->bindParam(':documentId', $documentId);
      $insertDocumentStmt->bindParam(':fileName', $fileName);
      $insertDocumentStmt->bindParam(':gradeLevelId', $studentData['gradeLevelId']);
      $insertDocumentStmt->bindParam(':userId', $userId);
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

  function getAllStudentDocuments() {
    include "connection.php";
    
    try {
      $sql = "SELECT 
                sd.id,
                sd.studentId,
                sd.fileName,
                sd.createdAt,
                sd.gradeLevelId,
                d.name as documentType,
                gl.name as gradeLevelName,
                CONCAT(s.firstname, ' ', s.lastname) as studentName
              FROM tblstudentdocument sd
              LEFT JOIN tbldocument d ON sd.documentId = d.id
              LEFT JOIN tblgradelevel gl ON sd.gradeLevelId = gl.id
              LEFT JOIN tblstudent s ON sd.studentId = s.id
              ORDER BY sd.id DESC";
      
      $stmt = $conn->prepare($sql);
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

  function processRelease($json)
  {
    include "connection.php";
    
    $json = json_decode($json, true);
    $requestId = $json['requestId'];
    
    // Debug logging
    error_log("processRelease called with requestId: " . $requestId);
    
    // Set Philippine timezone and get current datetime
    date_default_timezone_set('Asia/Manila');
    $datetime = date('Y-m-d h:i:s A');

    try {
      $conn->beginTransaction();

      // Check if current status is "Signatory"
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
      
      // Debug logging
      error_log("Current status for request " . $requestId . ": " . $currentStatus['statusId'] . " (" . $currentStatus['statusName'] . ")");
      
      if ($currentStatus['statusId'] != 3) { // 3 = Signatory
        $conn->rollBack();
        error_log("Request " . $requestId . " is not in Signatory status. Current status: " . $currentStatus['statusId']);
        return json_encode(['error' => 'Request must be in Signatory status to be released']);
      }

      // Change status to Release (statusId = 4)
      $sql = "INSERT INTO tblrequeststatus (requestId, statusId, createdAt) VALUES (:requestId, :statusId, :datetime)";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $statusId = 4; // Release status
      $stmt->bindParam(':statusId', $statusId);
      $stmt->bindParam(':datetime', $datetime);

      if (!$stmt->execute()) {
        $conn->rollBack();
        return json_encode(['error' => 'Failed to change status to Release']);
      }

      $conn->commit();
      return json_encode([
        'success' => true, 
        'message' => 'Request status changed to Release successfully',
        'newStatusId' => 4
      ]);

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function scheduleRelease($json)
  {
    include "connection.php";
    include "vendor/autoload.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];
    $releaseDate = $json['releaseDate'];
    $userId = $json['userId'];
    
    // Set Philippine timezone and get current datetime
    date_default_timezone_set('Asia/Manila');
    $datetime = date('Y-m-d H:i:s');

    try {
      $conn->beginTransaction();

      // First, get the request details and student information
      $requestSql = "SELECT 
                      r.id,
                      r.studentId,
                      r.purpose,
                      d.name as documentName,
                      s.firstname,
                      s.lastname,
                      s.email,
                      s.middlename,
                      CASE 
                        WHEN r.purpose IS NOT NULL THEN r.purpose
                        WHEN EXISTS (SELECT 1 FROM tblrequestpurpose rp WHERE rp.requestId = r.id) THEN 
                          (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') 
                           FROM tblrequestpurpose rp 
                           INNER JOIN tblpurpose p ON rp.purposeId = p.id 
                           WHERE rp.requestId = r.id)
                        ELSE 'No purpose specified'
                      END as displayPurpose
                    FROM tblrequest r
                    INNER JOIN tbldocument d ON r.documentId = d.id
                    INNER JOIN tblstudent s ON r.studentId = s.id
                    WHERE r.id = :requestId";
      
      $requestStmt = $conn->prepare($requestSql);
      $requestStmt->bindParam(':requestId', $requestId);
      $requestStmt->execute();
      
      if ($requestStmt->rowCount() == 0) {
        $conn->rollBack();
        return json_encode(['error' => 'Request not found']);
      }
      
      $requestData = $requestStmt->fetch(PDO::FETCH_ASSOC);
      
      // Check if release schedule already exists for this request
      $checkSql = "SELECT id FROM tblreleaseschedule WHERE requestId = :requestId";
      $checkStmt = $conn->prepare($checkSql);
      $checkStmt->bindParam(':requestId', $requestId);
      $checkStmt->execute();
      
      if ($checkStmt->rowCount() > 0) {
        // Update existing schedule
        $updateSql = "UPDATE tblreleaseschedule 
                      SET dateSchedule = :releaseDate, createdAt = :datetime 
                      WHERE requestId = :requestId";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bindParam(':releaseDate', $releaseDate);
        $updateStmt->bindParam(':datetime', $datetime);
        $updateStmt->bindParam(':requestId', $requestId);
        
        if (!$updateStmt->execute()) {
          $conn->rollBack();
          return json_encode(['error' => 'Failed to update release schedule']);
        }
      } else {
        // Insert new schedule
        $insertSql = "INSERT INTO tblreleaseschedule (requestId, userId, dateSchedule, createdAt) 
                      VALUES (:requestId, :userId, :releaseDate, :datetime)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bindParam(':requestId', $requestId);
        $insertStmt->bindParam(':userId', $userId);
        $insertStmt->bindParam(':releaseDate', $releaseDate);
        $insertStmt->bindParam(':datetime', $datetime);
        
        if (!$insertStmt->execute()) {
          $conn->rollBack();
          return json_encode(['error' => 'Failed to create release schedule']);
        }
      }

      // Send email notification
      $emailSent = $this->sendReleaseScheduleEmail($requestData, $releaseDate);
      
      if (!$emailSent) {
        // Log email failure but don't rollback the transaction
        error_log("Failed to send release schedule email for request ID: " . $requestId);
      }

      $conn->commit();
      return json_encode([
        'success' => true, 
        'message' => 'Release schedule set successfully for ' . date('F j, Y', strtotime($releaseDate)),
        'emailSent' => $emailSent
      ]);

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function sendReleaseScheduleEmail($requestData, $releaseDate)
  {
    try {
      // Include email configuration
      include_once "email_config.php";
      
      // Create PHPMailer instance
      $mail = new PHPMailer\PHPMailer\PHPMailer(true);
      
      // Server settings
      $mail->isSMTP();
      $mail->Host = SMTP_HOST;
      $mail->SMTPAuth = true;
      $mail->Username = SMTP_USERNAME;
      $mail->Password = SMTP_PASSWORD;
      $mail->SMTPSecure = SMTP_SECURE === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
      $mail->Port = SMTP_PORT;
      
      // Debug mode
      if (EMAIL_DEBUG) {
        $mail->SMTPDebug = 2;
      }
      
      // Recipients
      $mail->setFrom(FROM_EMAIL, FROM_NAME);
      $mail->addAddress($requestData['email'], $requestData['firstname'] . ' ' . $requestData['lastname']);
      
      // Content
      $mail->isHTML(true);
      $mail->Subject = EMAIL_SUBJECT_PREFIX . $requestData['documentName'];
      
      // Format the release date
      $formattedDate = date('F j, Y', strtotime($releaseDate));
      $formattedTime = OFFICE_HOURS;
      
      // Email body
      $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <div style='background-color: #5409DA; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin: 0;'>MOGCHS Registrar Office</h1>
          </div>
          
          <div style='padding: 30px; background-color: #f9f9f9;'>
            <h2 style='color: #333; margin-bottom: 20px;'>Document Release Schedule</h2>
            
            <p>Dear <strong>{$requestData['firstname']} {$requestData['lastname']}</strong>,</p>
            
            <p>Your document request has been processed and is ready for release.</p>
            
            <div style='background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #5409DA; margin: 20px 0;'>
              <h3 style='color: #5409DA; margin-top: 0;'>Request Details:</h3>
              <p><strong>Document:</strong> {$requestData['documentName']}</p>
              <p><strong>Purpose:</strong> {$requestData['displayPurpose']}</p>
              <p><strong>Release Date:</strong> {$formattedDate}</p>
              <p><strong>Office Hours:</strong> {$formattedTime}</p>
            </div>
            
                         <div style='background-color: #e8f4fd; padding: 15px; border-radius: 5px; border: 1px solid #bee5eb;'>
               <h4 style='color: #0c5460; margin-top: 0;'>Important Notes:</h4>
               <ul style='color: #0c5460; margin: 10px 0; padding-left: 20px;'>
                 <li>Please bring a valid ID for verification</li>
                 <li>If you cannot claim on the scheduled date, please contact the registrar office</li>
                 <li>Documents not claimed within " . RETENTION_DAYS . " days may be disposed of</li>
               </ul>
             </div>
            
            <p>If you have any questions, please contact the registrar office.</p>
            
            <p>Best regards,<br>
            <strong>MOGCHS Registrar Office</strong></p>
          </div>
          
          <div style='background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;'>
            <p style='margin: 0;'>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      ";
      
      // Plain text version
      $mail->AltBody = "
        MOGCHS Registrar Office
        
        Document Release Schedule
        
        Dear {$requestData['firstname']} {$requestData['lastname']},
        
        Your document request has been processed and is ready for release.
        
        Request Details:
        - Document: {$requestData['documentName']}
        - Purpose: {$requestData['displayPurpose']}
        - Release Date: {$formattedDate}
        - Office Hours: {$formattedTime}
        
                 Important Notes:
         - Please bring a valid ID for verification
         - If you cannot claim on the scheduled date, please contact the registrar office
         - Documents not claimed within " . RETENTION_DAYS . " days may be disposed of
        
        If you have any questions, please contact the registrar office.
        
        Best regards,
        MOGCHS Registrar Office
      ";
      
      $mail->send();
      return true;
      
    } catch (Exception $e) {
      error_log("Email sending failed: " . $e->getMessage());
      return false;
    }
  }

  function getReleaseSchedule($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      $sql = "SELECT 
                rs.id,
                rs.dateSchedule,
                rs.createdAt,
                u.firstname,
                u.lastname
              FROM tblreleaseschedule rs
              LEFT JOIN tbluser u ON rs.userId = u.id
              WHERE rs.requestId = :requestId
              ORDER BY rs.createdAt DESC
              LIMIT 1";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $schedule = $stmt->fetch(PDO::FETCH_ASSOC);
        return json_encode($schedule);
      }
      return json_encode(null);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  // Add this to the User class in registrar.php
function addForgotLrnRequest($json)
{
  include "connection.php";
  
  $json = json_decode($json, true);
  $firstname = $json['firstname'];
  $lastname = $json['lastname'];
  $email = $json['email'];
  
  try {
    $sql = "INSERT INTO tblforgotlrn (firstname, lastname, email) 
            VALUES (:firstname, :lastname, :email)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':firstname', $firstname);
    $stmt->bindParam(':lastname', $lastname);
    $stmt->bindParam(':email', $email);
    
    if ($stmt->execute()) {
      return json_encode(['success' => true, 'message' => 'Request submitted successfully']);
    }
    return json_encode(['error' => 'Failed to submit request']);
    
  } catch (PDOException $e) {
    return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
  }
}

function getForgotLrnRequests()
{
  include "connection.php";
  
  try {
    $sql = "SELECT f.*, u.firstname as processed_by_name 
            FROM tblforgotlrn f 
            LEFT JOIN tbluser u ON f.processed_by = u.id 
            ORDER BY f.created_at DESC";
    
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

function processLrnRequest($json)
{
  include "connection.php";
  include "vendor/autoload.php";
  
  $json = json_decode($json, true);
  $requestId = $json['requestId'];
  $userId = $json['userId'];
  $studentId = $json['studentId']; // Add this to accept the selected student's ID
  $lrn = $json['lrn']; // Add this to accept the selected student's LRN
  
  try {
    $conn->beginTransaction();
    
    // Get the request details
    $sql = "SELECT f.* 
            FROM tblforgotlrn f
            WHERE f.id = :requestId";
            
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':requestId', $requestId);
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
      $conn->rollBack();
      return json_encode(['error' => 'Request not found']);
    }
    
    $requestData = $stmt->fetch(PDO::FETCH_ASSOC);
    $requestData['lrn'] = $lrn; // Add the selected LRN to the request data
    
    // Update request status
    $updateSql = "UPDATE tblforgotlrn 
                  SET is_processed = 1, 
                      processed_by = :userId,
                      processed_at = NOW() 
                  WHERE id = :requestId";
                  
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bindParam(':userId', $userId);
    $updateStmt->bindParam(':requestId', $requestId);
    
    if (!$updateStmt->execute()) {
      $conn->rollBack();
      return json_encode(['error' => 'Failed to update request status']);
    }
    
    // Send email with LRN
    $emailSent = $this->sendLrnEmail($requestData);
    
    if (!$emailSent) {
      error_log("Failed to send LRN email for request ID: " . $requestId);
    }
    
    $conn->commit();
    return json_encode([
      'success' => true,
      'message' => 'Request processed successfully',
      'emailSent' => $emailSent
    ]);
    
  } catch (PDOException $e) {
    $conn->rollBack();
    return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
  }
}

function sendLrnEmail($requestData)
{
  try {
    include_once "email_config.php";
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    // Server settings
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_SECURE === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = SMTP_PORT;
    
    // Recipients
    $mail->setFrom(FROM_EMAIL, FROM_NAME);
    $mail->addAddress($requestData['email']);
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = EMAIL_SUBJECT_PREFIX . 'Your LRN Information';
    
    $mail->Body = "
      <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <div style='background-color: #5409DA; color: white; padding: 20px; text-align: center;'>
          <h1 style='margin: 0;'>MOGCHS Registrar Office</h1>
        </div>
        
        <div style='padding: 30px; background-color: #f9f9f9;'>
          <h2 style='color: #333; margin-bottom: 20px;'>LRN Information</h2>
          
          <p>Dear <strong>{$requestData['firstname']} {$requestData['lastname']}</strong>,</p>
          
          <p>As per your request, here is your Learner Reference Number (LRN):</p>
          
          <div style='background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #5409DA; margin: 20px 0;'>
            <h3 style='color: #5409DA; margin: 0;'>Your LRN: {$requestData['lrn']}</h3>
          </div>
          
          <p>Please keep this information secure and use it for future reference.</p>
          
          <p>Best regards,<br>
          <strong>MOGCHS Registrar Office</strong></p>
        </div>
        
        <div style='background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;'>
          <p style='margin: 0;'>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    ";
    
    $mail->AltBody = "
      MOGCHS Registrar Office
      
      LRN Information
      
      Dear {$requestData['firstname']} {$requestData['lastname']},
      
      As per your request, here is your Learner Reference Number (LRN):
      
      Your LRN: {$requestData['lrn']}
      
      Please keep this information secure and use it for future reference.
      
      Best regards,
      MOGCHS Registrar Office
    ";
    
    $mail->send();
    return true;
    
  } catch (Exception $e) {
    error_log("Email sending failed: " . $e->getMessage());
    return false;
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
  case "debugStudentGradeLevel":
    echo $user->debugStudentGradeLevel($json);
    break;
  case "getAllStudentDocuments":
    echo $user->getAllStudentDocuments();
    break;
  case "processRelease":
    echo $user->processRelease($json);
    break;
  case "scheduleRelease":
    echo $user->scheduleRelease($json);
    break;
  case "getReleaseSchedule":
    echo $user->getReleaseSchedule($json);
    break;
  case "addForgotLrnRequest":
    echo $user->addForgotLrnRequest($json);
    break;
  case "getForgotLrnRequests":
    echo $user->getForgotLrnRequests();
    break;
  case "processLrnRequest":
    echo $user->processLrnRequest($json);
  break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>  