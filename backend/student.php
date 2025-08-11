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

  function addRequestDocument($json)
  {
    include "connection.php";

    $json = json_decode($json, true);

    try {
      $conn->beginTransaction();

      // Set Philippine timezone and get current datetime
      date_default_timezone_set('Asia/Manila');
      $philippineDateTime = date('Y-m-d h:i:s A');

      // First, get the status ID for "Pending" status
      $statusSql = "SELECT id FROM tblstatus WHERE name = 'Pending' LIMIT 1";
      $statusStmt = $conn->prepare($statusSql);
      $statusStmt->execute();
      $statusResult = $statusStmt->fetch(PDO::FETCH_ASSOC);

      if (!$statusResult) {
        throw new PDOException("Pending status not found in status request table");
      }

      $pendingStatusId = $statusResult['id'];

      $sql = "INSERT INTO tblrequest (studentId, documentId, purpose, createdAt) 
              VALUES (:userId, :documentId, :purpose, :datetime)";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $json['userId']);
      $stmt->bindParam(':documentId', $json['documentId']);
      $stmt->bindParam(':purpose', $json['purpose']);
      $stmt->bindParam(':datetime', $philippineDateTime);

      if ($stmt->execute()) {
        $requestId = $conn->lastInsertId();
        
        // Handle file upload if attachment exists
        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
          $uploadDir = 'requirements/';
          
          // Create directory if it doesn't exist
          if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
          }

          // Keep original filename
          $originalFileName = $_FILES['attachment']['name'];
          $fileExtension = pathinfo($originalFileName, PATHINFO_EXTENSION);
          $filePath = $uploadDir . $originalFileName;

          // Validate file type (only images)
          $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
          if (!in_array(strtolower($fileExtension), $allowedTypes)) {
            throw new PDOException("Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed.");
          }

          // Check file size (max 5MB)
          if ($_FILES['attachment']['size'] > 5 * 1024 * 1024) {
            throw new PDOException("File size too large. Maximum size is 5MB.");
          }

          if (move_uploaded_file($_FILES['attachment']['tmp_name'], $filePath)) {
            // Get the first typeId for single file upload
            $currentTypeId = isset($json['typeIds'][0]) ? $json['typeIds'][0] : null;
            
            if (!$currentTypeId) {
              throw new PDOException("Missing requirement type for attachment");
            }

            // Insert into tblrequirements - store only filename without path
            $reqSql = "INSERT INTO tblrequirements (requestId, filepath, typeId, createdAt) VALUES (:requestId, :filepath, :typeId, :datetime)";
            $reqStmt = $conn->prepare($reqSql);
            $reqStmt->bindParam(':requestId', $requestId);
            $reqStmt->bindParam(':filepath', $originalFileName);
            $reqStmt->bindParam(':typeId', $currentTypeId);
            $reqStmt->bindParam(':datetime', $philippineDateTime);
            
            if (!$reqStmt->execute()) {
              throw new PDOException("Failed to save file information to database");
            }
          } else {
            throw new PDOException("Failed to upload file");
          }
        }

        // Handle multiple file uploads if attachments exist
        if (isset($_FILES['attachments'])) {
          $uploadDir = 'requirements/';
          
          // Create directory if it doesn't exist
          if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
          }

          $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
          $uploadedFiles = 0;

          // Handle multiple files
          $fileCount = count($_FILES['attachments']['name']);
          
          for ($i = 0; $i < $fileCount; $i++) {
            // Skip if no file or error
            if ($_FILES['attachments']['error'][$i] !== UPLOAD_ERR_OK) {
              continue;
            }

            $originalFileName = $_FILES['attachments']['name'][$i];
            $fileTmpName = $_FILES['attachments']['tmp_name'][$i];
            $fileSize = $_FILES['attachments']['size'][$i];
            
            $fileExtension = pathinfo($originalFileName, PATHINFO_EXTENSION);
            
            // Validate file type
            if (!in_array(strtolower($fileExtension), $allowedTypes)) {
              throw new PDOException("Invalid file type for '$originalFileName'. Only JPG, PNG, GIF, and PDF files are allowed.");
            }

            // Check file size (max 5MB per file)
            if ($fileSize > 5 * 1024 * 1024) {
              throw new PDOException("File size too large for '$originalFileName'. Maximum size is 5MB per file.");
            }

            // Keep original filename
            $filePath = $uploadDir . $originalFileName;

            if (move_uploaded_file($fileTmpName, $filePath)) {
              // Get the corresponding typeId for this file
              $currentTypeId = isset($json['typeIds'][$i]) ? $json['typeIds'][$i] : null;
              
              if (!$currentTypeId) {
                throw new PDOException("Missing requirement type for file '$originalFileName'");
              }

              // Insert into tblrequirements - store only filename without path
              $reqSql = "INSERT INTO tblrequirements (requestId, filepath, typeId, createdAt) VALUES (:requestId, :filepath, :typeId, :datetime)";
              $reqStmt = $conn->prepare($reqSql);
              $reqStmt->bindParam(':requestId', $requestId);
              $reqStmt->bindParam(':filepath', $originalFileName); // Store only filename
              $reqStmt->bindParam(':typeId', $currentTypeId);
              $reqStmt->bindParam(':datetime', $philippineDateTime);
              
              if ($reqStmt->execute()) {
                $uploadedFiles++;
              } else {
                throw new PDOException("Failed to save file information for '$originalFileName' to database");
              }
            } else {
              throw new PDOException("Failed to upload file '$originalFileName'");
            }
          }
        }
        
        // Insert into tblrequeststatus with the correct pending status ID
        $statusSql = "INSERT INTO tblrequeststatus (requestId, statusId, createdAt) VALUES (:requestId, :statusId, :datetime)";
        $statusStmt = $conn->prepare($statusSql);
        $statusStmt->bindParam(':requestId', $requestId);
        $statusStmt->bindParam(':statusId', $pendingStatusId);
        $statusStmt->bindParam(':datetime', $philippineDateTime);

        if ($statusStmt->execute()) {
          $conn->commit();
          return json_encode(['success' => true, 'requestId' => $requestId]);
        }
      }

      $conn->rollBack();
      return json_encode(['error' => 'Failed to add request: ' . implode(" ", $stmt->errorInfo())]);

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function addCombinedRequestDocument($json)
  {
    include "connection.php";

    $json = json_decode($json, true);

    try {
      $conn->beginTransaction();

      // Set Philippine timezone and get current datetime
      date_default_timezone_set('Asia/Manila');
      $philippineDateTime = date('Y-m-d h:i:s A');

      // First, get the status ID for "Pending" status
      $statusSql = "SELECT id FROM tblstatus WHERE name = 'Pending' LIMIT 1";
      $statusStmt = $conn->prepare($statusSql);
      $statusStmt->execute();
      $statusResult = $statusStmt->fetch(PDO::FETCH_ASSOC);

      if (!$statusResult) {
        throw new PDOException("Pending status not found in status request table");
      }

      $pendingStatusId = $statusResult['id'];

      // First, create request for the secondary document (e.g., Diploma)
      $sql = "INSERT INTO tblrequest (studentId, documentId, purpose, createdAt) 
              VALUES (:userId, :documentId, :purpose, :datetime)";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $json['userId']);
      $stmt->bindParam(':documentId', $json['secondaryDocumentId']);
      $stmt->bindParam(':purpose', $json['purpose']);
      $stmt->bindParam(':datetime', $philippineDateTime);

      if ($stmt->execute()) {
        $secondaryRequestId = $conn->lastInsertId();
        
        // Insert status for secondary request
        $statusSql = "INSERT INTO tblrequeststatus (requestId, statusId, createdAt) VALUES (:requestId, :statusId, :datetime)";
        $statusStmt = $conn->prepare($statusSql);
        $statusStmt->bindParam(':requestId', $secondaryRequestId);
        $statusStmt->bindParam(':statusId', $pendingStatusId);
        $statusStmt->bindParam(':datetime', $philippineDateTime);
        $statusStmt->execute();

        // Now create request for the primary document (e.g., CAV)
        $stmt2 = $conn->prepare($sql);
        $stmt2->bindParam(':userId', $json['userId']);
        $stmt2->bindParam(':documentId', $json['primaryDocumentId']);
        $stmt2->bindParam(':purpose', $json['purpose']);
        $stmt2->bindParam(':datetime', $philippineDateTime);

        if ($stmt2->execute()) {
          $primaryRequestId = $conn->lastInsertId();
          
          // Handle file upload if attachments exist
          if (isset($_FILES['attachments'])) {
            $uploadDir = 'requirements/';
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
              mkdir($uploadDir, 0777, true);
            }

            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
            $uploadedFiles = 0;

            // Handle multiple files
            $fileCount = count($_FILES['attachments']['name']);
            
            for ($i = 0; $i < $fileCount; $i++) {
              // Skip if no file or error
              if ($_FILES['attachments']['error'][$i] !== UPLOAD_ERR_OK) {
                continue;
              }

              $originalFileName = $_FILES['attachments']['name'][$i];
              $fileTmpName = $_FILES['attachments']['tmp_name'][$i];
              $fileSize = $_FILES['attachments']['size'][$i];
              
              $fileExtension = pathinfo($originalFileName, PATHINFO_EXTENSION);
              
              // Validate file type
              if (!in_array(strtolower($fileExtension), $allowedTypes)) {
                throw new PDOException("Invalid file type for '$originalFileName'. Only JPG, PNG, GIF, and PDF files are allowed.");
              }

              // Check file size (max 5MB per file)
              if ($fileSize > 5 * 1024 * 1024) {
                throw new PDOException("File size too large for '$originalFileName'. Maximum size is 5MB per file.");
              }

              // Keep original filename
              $filePath = $uploadDir . $originalFileName;

              if (move_uploaded_file($fileTmpName, $filePath)) {
                // Get the corresponding typeId for this file
                $currentTypeId = isset($json['typeIds'][$i]) ? $json['typeIds'][$i] : null;
                
                if (!$currentTypeId) {
                  throw new PDOException("Missing requirement type for file '$originalFileName'");
                }

                // Insert into tblrequirements for the primary request (CAV)
                $reqSql = "INSERT INTO tblrequirements (requestId, filepath, typeId, createdAt) VALUES (:requestId, :filepath, :typeId, :datetime)";
                $reqStmt = $conn->prepare($reqSql);
                $reqStmt->bindParam(':requestId', $primaryRequestId);
                $reqStmt->bindParam(':filepath', $originalFileName);
                $reqStmt->bindParam(':typeId', $currentTypeId);
                $reqStmt->bindParam(':datetime', $philippineDateTime);
                
                if ($reqStmt->execute()) {
                  $uploadedFiles++;
                } else {
                  throw new PDOException("Failed to save file information for '$originalFileName' to database");
                }
              } else {
                throw new PDOException("Failed to upload file '$originalFileName'");
              }
            }
          }
          
          // Insert status for primary request
          $statusStmt2 = $conn->prepare($statusSql);
          $statusStmt2->bindParam(':requestId', $primaryRequestId);
          $statusStmt2->bindParam(':statusId', $pendingStatusId);
          $statusStmt2->bindParam(':datetime', $philippineDateTime);

          if ($statusStmt2->execute()) {
            $conn->commit();
            return json_encode([
              'success' => true, 
              'primaryRequestId' => $primaryRequestId,
              'secondaryRequestId' => $secondaryRequestId
            ]);
          }
        }
      }

      $conn->rollBack();
      return json_encode(['error' => 'Failed to add combined request: ' . implode(" ", $stmt->errorInfo())]);

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
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

  function getRequirementsType()
  {
    include "connection.php";

    $sql = "SELECT * FROM tblrequirementstype";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $requestTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($requestTypes);
    }
    return json_encode([]);
  }

  function getRequestTracking($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      $sql = "SELECT 
                rs.id,
                s.name as status,
                s.id as statusId,
                rs.createdAt,
                DATE_FORMAT(rs.createdAt, '%m/%d/%Y') as dateFormatted
              FROM tblrequeststatus rs
              INNER JOIN tblstatus s ON rs.statusId = s.id
              WHERE rs.requestId = :requestId
              ORDER BY rs.id ASC";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $tracking = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($tracking);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getProfile($json){
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];

    try {
      $sql = "SELECT 
                s.id,
                s.firstname,
                s.middlename,
                s.lastname,
                s.lrn,
                s.email,
                s.birthDate,
                s.age,
                s.religion,
                s.completeAddress,
                s.fatherName,
                s.motherName,
                s.guardianName,
                s.guardianRelationship,
                s.sectionId,
                s.schoolyearId,
                s.strandId,
                sec.name as sectionName,
                sy.year as schoolYear,
                t.name as track,
                st.name as strand
              FROM tblstudent s
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblschoolyear sy ON s.schoolyearId = sy.id
              LEFT JOIN tblstrand st ON s.strandId = st.id
              LEFT JOIN tbltrack t ON st.trackId = t.id
              WHERE s.id = :userId";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $userId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        return json_encode($profile);
      }
      return json_encode(['error' => 'Student profile not found']);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function updateProfile($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];

    try {
      $sql = "UPDATE tblstudent 
              SET firstname = :firstname, 
                  middlename = :middlename, 
                  lastname = :lastname, 
                  email = :email,
                  birthDate = :birthDate,
                  age = :age,
                  religion = :religion,
                  completeAddress = :completeAddress,
                  fatherName = :fatherName,
                  motherName = :motherName,
                  guardianName = :guardianName,
                  guardianRelationship = :guardianRelationship,
                  updatedAt = NOW()
              WHERE id = :userId";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':firstname', $json['firstname']);
      $stmt->bindParam(':middlename', $json['middlename']);
      $stmt->bindParam(':lastname', $json['lastname']);
      $stmt->bindParam(':email', $json['email']);
      $stmt->bindParam(':birthDate', $json['birthDate']);
      $stmt->bindParam(':age', $json['age']);
      $stmt->bindParam(':religion', $json['religion']);
      $stmt->bindParam(':completeAddress', $json['completeAddress']);
      $stmt->bindParam(':fatherName', $json['fatherName']);
      $stmt->bindParam(':motherName', $json['motherName']);
      $stmt->bindParam(':guardianName', $json['guardianName']);
      $stmt->bindParam(':guardianRelationship', $json['guardianRelationship']);
      $stmt->bindParam(':userId', $userId);

      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Profile updated successfully']);
      } else {
        return json_encode(['error' => 'Failed to update profile']);
      }

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }
}

$input = json_decode(file_get_contents('php://input'), true);



$operation = isset($_POST["operation"]) ? $_POST["operation"] : "0";
$json = isset($_POST["json"]) ? $_POST["json"] : "0";

$user = new User();

switch ($operation) {
  case "GetDocuments":
    echo $user->GetDocuments();
    break;
  case "addRequestDocument":
    echo $user->addRequestDocument($json);
    break;
  case "addCombinedRequestDocument":
    echo $user->addCombinedRequestDocument($json);
    break;
  case "getUserRequests":
    echo $user->getUserRequests($json);
    break;
  case "getRequirementsType":
    echo $user->getRequirementsType();
    break;
  case "getRequestTracking":
    echo $user->getRequestTracking($json);
    break;
  case "getProfile":
    echo $user->getProfile($json);
    break;
  case "updateProfile":
    echo $user->updateProfile($json);
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>