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
      $philippineDateTime = date('Y-m-d H:i:s');

      // First, get the status ID for "Pending" status
      $statusSql = "SELECT id FROM tblstatus WHERE name = 'Pending' LIMIT 1";
      $statusStmt = $conn->prepare($statusSql);
      $statusStmt->execute();
      $statusResult = $statusStmt->fetch(PDO::FETCH_ASSOC);

      if (!$statusResult) {
        throw new PDOException("Pending status not found in status request table");
      }

      $pendingStatusId = $statusResult['id'];

      // Check if this document has predefined purposes
      $purposeCheckSql = "SELECT COUNT(*) as purposeCount FROM tblpurpose WHERE documentId = :documentId";
      $purposeCheckStmt = $conn->prepare($purposeCheckSql);
      $purposeCheckStmt->bindParam(':documentId', $json['documentId']);
      $purposeCheckStmt->execute();
      $purposeCheckResult = $purposeCheckStmt->fetch(PDO::FETCH_ASSOC);
      
      $hasPredefinedPurposes = $purposeCheckResult['purposeCount'] > 0;

      // If document has predefined purposes, validate that at least one is selected
      if ($hasPredefinedPurposes) {
        if (!isset($json['purposeIds']) || empty($json['purposeIds'])) {
          throw new PDOException("Please select at least one purpose for this document type.");
        }
      } else {
        // If no predefined purposes, validate that custom purpose is provided
        if (!isset($json['purpose']) || empty(trim($json['purpose']))) {
          throw new PDOException("Please provide a purpose for this request.");
        }
      }

      $sql = "INSERT INTO tblrequest (studentId, purpose, createdAt) 
              VALUES (:userId, :purpose, :datetime)";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $json['userId']);
      
      // Set purpose field - if predefined purposes exist, set to NULL since purposes are stored in tblrequestpurpose
      if ($hasPredefinedPurposes) {
        $purpose = null; // Set to NULL when predefined purposes exist
      } else {
        $purpose = $json['purpose'];
      }
      
      $stmt->bindParam(':purpose', $purpose);
      $stmt->bindParam(':datetime', $philippineDateTime);

      if ($stmt->execute()) {
        $requestId = $conn->lastInsertId();
        
        // Insert document into tblrequestdocument
        $docSql = "INSERT INTO tblrequestdocument (requestId, documentId) VALUES (:requestId, :documentId)";
        $docStmt = $conn->prepare($docSql);
        $docStmt->bindParam(':requestId', $requestId);
        $docStmt->bindParam(':documentId', $json['documentId']);
        
        if (!$docStmt->execute()) {
          throw new PDOException("Failed to save document to request");
        }
        
        // Insert purposes into tblrequestpurpose if predefined purposes exist
        if ($hasPredefinedPurposes && isset($json['purposeIds'])) {
          foreach ($json['purposeIds'] as $purposeId) {
            $purposeSql = "INSERT INTO tblrequestpurpose (requestId, purposeId) VALUES (:requestId, :purposeId)";
            $purposeStmt = $conn->prepare($purposeSql);
            $purposeStmt->bindParam(':requestId', $requestId);
            $purposeStmt->bindParam(':purposeId', $purposeId);
            
            if (!$purposeStmt->execute()) {
              throw new PDOException("Failed to save purpose information to database");
            }
          }
        }
        
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

  function addMultipleDocumentRequest($json)
  {
    include "connection.php";

    $json = json_decode($json, true);

    try {
      $conn->beginTransaction();

      // Set Philippine timezone and get current datetime
      date_default_timezone_set('Asia/Manila');
      $philippineDateTime = date('Y-m-d H:i:s');

      // First, get the status ID for "Pending" status
      $statusSql = "SELECT id FROM tblstatus WHERE name = 'Pending' LIMIT 1";
      $statusStmt = $conn->prepare($statusSql);
      $statusStmt->execute();
      $statusResult = $statusStmt->fetch(PDO::FETCH_ASSOC);

      if (!$statusResult) {
        throw new PDOException("Pending status not found in status request table");
      }

      $pendingStatusId = $statusResult['id'];

      // Validate required fields
      if (!isset($json['userId']) || !isset($json['documentIds']) || empty($json['documentIds'])) {
        throw new PDOException("Missing required fields: userId and documentIds");
      }

      // Create a single request record for the transaction
      $requestSql = "INSERT INTO tblrequest (studentId, purpose, createdAt) VALUES (:userId, :purpose, :datetime)";
      $requestStmt = $conn->prepare($requestSql);
      $requestStmt->bindParam(':userId', $json['userId']);
      
      // Use the purpose from the request
      $purpose = isset($json['purpose']) && !empty(trim($json['purpose'])) ? $json['purpose'] : null;
      $requestStmt->bindParam(':purpose', $purpose);
      $requestStmt->bindParam(':datetime', $philippineDateTime);

      if (!$requestStmt->execute()) {
        throw new PDOException("Failed to create request record");
      }

      $requestId = $conn->lastInsertId();

      // Insert each document into tblrequestdocument (multiple rows for multiple copies)
      foreach ($json['documentIds'] as $documentId) {
        $quantity = isset($json['documentQuantities'][$documentId]) ? $json['documentQuantities'][$documentId] : 1;
        
        // Insert multiple rows for each copy of the document
        for ($i = 0; $i < $quantity; $i++) {
          $docSql = "INSERT INTO tblrequestdocument (requestId, documentId) VALUES (:requestId, :documentId)";
          $docStmt = $conn->prepare($docSql);
          $docStmt->bindParam(':requestId', $requestId);
          $docStmt->bindParam(':documentId', $documentId);
          
          if (!$docStmt->execute()) {
            throw new PDOException("Failed to save document copy " . ($i + 1) . " to request");
          }
        }
      }

      // Handle purposes if provided
      if (isset($json['purposeIds']) && !empty($json['purposeIds'])) {
        foreach ($json['purposeIds'] as $purposeId) {
          $purposeSql = "INSERT INTO tblrequestpurpose (requestId, purposeId) VALUES (:requestId, :purposeId)";
          $purposeStmt = $conn->prepare($purposeSql);
          $purposeStmt->bindParam(':requestId', $requestId);
          $purposeStmt->bindParam(':purposeId', $purposeId);
          
          if (!$purposeStmt->execute()) {
            throw new PDOException("Failed to save purpose information to database");
          }
        }
      }

      // Handle file uploads if attachments exist
      if (isset($_FILES['attachments'])) {
        $uploadDir = 'requirements/';
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadDir)) {
          mkdir($uploadDir, 0777, true);
        }

        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
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

          $filePath = $uploadDir . $originalFileName;

          if (move_uploaded_file($fileTmpName, $filePath)) {
            // Get the corresponding typeId for this file
            $currentTypeId = isset($json['typeIds'][$i]) ? $json['typeIds'][$i] : null;
            
            if (!$currentTypeId) {
              throw new PDOException("Missing requirement type for file '$originalFileName'");
            }

            // Insert into tblrequirements
            $reqSql = "INSERT INTO tblrequirements (requestId, filepath, typeId, createdAt) VALUES (:requestId, :filepath, :typeId, :datetime)";
            $reqStmt = $conn->prepare($reqSql);
            $reqStmt->bindParam(':requestId', $requestId);
            $reqStmt->bindParam(':filepath', $originalFileName);
            $reqStmt->bindParam(':typeId', $currentTypeId);
            $reqStmt->bindParam(':datetime', $philippineDateTime);
            
            if (!$reqStmt->execute()) {
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
      
      if (!$statusStmt->execute()) {
        throw new PDOException("Failed to set request status");
      }

      $conn->commit();
      return json_encode(["success" => true, "message" => "Multiple document request submitted successfully", "requestId" => $requestId]);
      
    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(["success" => false, "message" => $e->getMessage()]);
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
      $philippineDateTime = date('Y-m-d H:i:s');

      // First, get the status ID for "Pending" status
      $statusSql = "SELECT id FROM tblstatus WHERE name = 'Pending' LIMIT 1";
      $statusStmt = $conn->prepare($statusSql);
      $statusStmt->execute();
      $statusResult = $statusStmt->fetch(PDO::FETCH_ASSOC);

      if (!$statusResult) {
        throw new PDOException("Pending status not found in status request table");
      }

      $pendingStatusId = $statusResult['id'];

      // Check which document actually has predefined purposes
      $primaryPurposeCheckSql = "SELECT COUNT(*) as purposeCount FROM tblpurpose WHERE documentId = :documentId";
      $primaryPurposeCheckStmt = $conn->prepare($primaryPurposeCheckSql);
      $primaryPurposeCheckStmt->bindParam(':documentId', $json['primaryDocumentId']);
      $primaryPurposeCheckStmt->execute();
      $primaryPurposeCheckResult = $primaryPurposeCheckStmt->fetch(PDO::FETCH_ASSOC);
      
      $secondaryPurposeCheckSql = "SELECT COUNT(*) as purposeCount FROM tblpurpose WHERE documentId = :documentId";
      $secondaryPurposeCheckStmt = $conn->prepare($secondaryPurposeCheckSql);
      $secondaryPurposeCheckStmt->bindParam(':documentId', $json['secondaryDocumentId']);
      $secondaryPurposeCheckStmt->execute();
      $secondaryPurposeCheckResult = $secondaryPurposeCheckStmt->fetch(PDO::FETCH_ASSOC);
      
      $primaryHasPurposes = $primaryPurposeCheckResult['purposeCount'] > 0;
      $secondaryHasPurposes = $secondaryPurposeCheckResult['purposeCount'] > 0;
      
      // Determine which document should have purposes inserted
      $documentWithPurposes = null;
      $purposeIds = [];
      
      if ($primaryHasPurposes) {
        $documentWithPurposes = 'primary';
        if (!isset($json['purposeIds']) || empty($json['purposeIds'])) {
          throw new PDOException("Please select at least one purpose for the primary document type.");
        }
        $purposeIds = $json['purposeIds'];
      } elseif ($secondaryHasPurposes) {
        $documentWithPurposes = 'secondary';
        if (!isset($json['purposeIds']) || empty($json['purposeIds'])) {
          throw new PDOException("Please select at least one purpose for the secondary document type.");
        }
        $purposeIds = $json['purposeIds'];
      } else {
        // Neither document has predefined purposes, so custom purpose is required
        if (!isset($json['purpose']) || empty(trim($json['purpose']))) {
          throw new PDOException("Please provide a purpose for this request.");
        }
      }

      // First, create request for the secondary document (e.g., Diploma)
      $sql = "INSERT INTO tblrequest (studentId, purpose, createdAt) 
              VALUES (:userId, :purpose, :datetime)";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $json['userId']);
      
      // Set purpose field - if any document has predefined purposes, set to NULL since purposes are stored in tblrequestpurpose
      if ($documentWithPurposes) {
        $purpose = null; // Set to NULL when predefined purposes exist
      } else {
        $purpose = $json['purpose'];
      }
      
      $stmt->bindParam(':purpose', $purpose);
      $stmt->bindParam(':datetime', $philippineDateTime);

      if ($stmt->execute()) {
        $secondaryRequestId = $conn->lastInsertId();
        
        // Insert secondary document into tblrequestdocument
        $docSql = "INSERT INTO tblrequestdocument (requestId, documentId) VALUES (:requestId, :documentId)";
        $docStmt = $conn->prepare($docSql);
        $docStmt->bindParam(':requestId', $secondaryRequestId);
        $docStmt->bindParam(':documentId', $json['secondaryDocumentId']);
        
        if (!$docStmt->execute()) {
          throw new PDOException("Failed to save secondary document to request");
        }
        
        // Insert purposes into tblrequestpurpose ONLY if the secondary document has predefined purposes
        if ($documentWithPurposes === 'secondary' && !empty($purposeIds)) {
          foreach ($purposeIds as $purposeId) {
            $purposeSql = "INSERT INTO tblrequestpurpose (requestId, purposeId) VALUES (:requestId, :purposeId)";
            $purposeStmt = $conn->prepare($purposeSql);
            $purposeStmt->bindParam(':requestId', $secondaryRequestId);
            $purposeStmt->bindParam(':purposeId', $purposeId);
            
            if (!$purposeStmt->execute()) {
              throw new PDOException("Failed to save purpose information to database");
            }
          }
        }
        
        // Handle file upload if attachments exist - attach to Diploma request since these are Diploma requirements
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

              // Insert into tblrequirements for the secondary request (Diploma)
              $reqSql = "INSERT INTO tblrequirements (requestId, filepath, typeId, createdAt) VALUES (:requestId, :filepath, :typeId, :datetime)";
              $reqStmt = $conn->prepare($reqSql);
              $reqStmt->bindParam(':requestId', $secondaryRequestId);
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
        $stmt2->bindParam(':purpose', $purpose);
        $stmt2->bindParam(':datetime', $philippineDateTime);

        if ($stmt2->execute()) {
          $primaryRequestId = $conn->lastInsertId();
          
          // Insert primary document into tblrequestdocument
          $docStmt2 = $conn->prepare($docSql);
          $docStmt2->bindParam(':requestId', $primaryRequestId);
          $docStmt2->bindParam(':documentId', $json['primaryDocumentId']);
          
          if (!$docStmt2->execute()) {
            throw new PDOException("Failed to save primary document to request");
          }
          
          // Insert purposes into tblrequestpurpose ONLY if the primary document has predefined purposes
          if ($documentWithPurposes === 'primary' && !empty($purposeIds)) {
            foreach ($purposeIds as $purposeId) {
              $purposeSql = "INSERT INTO tblrequestpurpose (requestId, purposeId) VALUES (:requestId, :purposeId)";
              $purposeStmt = $conn->prepare($purposeSql);
              $purposeStmt->bindParam(':requestId', $primaryRequestId);
              $purposeStmt->bindParam(':purposeId', $purposeId);
              
              if (!$purposeStmt->execute()) {
                throw new PDOException("Failed to save purpose information to database");
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
      // Set Philippine timezone for calculations
      date_default_timezone_set('Asia/Manila');
      
      // First get all requests for the user
      $sql = "SELECT 
                r.id,
                r.purpose,
                DATE(r.createdAt) as dateRequested,
                r.createdAt as dateRequestedFull,
                s.name as status,
                s.id as statusId,
                rs.createdAt as currentStatusDate,
                rs_schedule.dateSchedule as releaseDate,
                DATE_FORMAT(rs_schedule.dateSchedule, '%M %d, %Y') as releaseDateFormatted,
                ed.days as expectedDays
              FROM tblrequest r
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              LEFT JOIN tblreleaseschedule rs_schedule ON r.id = rs_schedule.requestId
              LEFT JOIN tblexpecteddays ed ON ed.id = 1
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
        
        // For each request, get the associated documents from tblrequestdocument
        foreach ($requests as &$request) {
          // Get documents from tblrequestdocument (works for both single and multiple document requests)
          $docSql = "SELECT d.name, COUNT(*) as quantity 
                    FROM tblrequestdocument rd 
                    INNER JOIN tbldocument d ON rd.documentId = d.id 
                    WHERE rd.requestId = :requestId 
                    GROUP BY d.id, d.name 
                    ORDER BY d.name";
          $docStmt = $conn->prepare($docSql);
          $docStmt->bindParam(':requestId', $request['id']);
          $docStmt->execute();
          
          if ($docStmt->rowCount() > 0) {
            $documents = $docStmt->fetchAll(PDO::FETCH_ASSOC);
            $documentNames = [];
            $totalCopies = 0;
            
            foreach ($documents as $doc) {
              if ($doc['quantity'] > 1) {
                $documentNames[] = $doc['name'] . ' (' . $doc['quantity'] . ' copies)';
              } else {
                $documentNames[] = $doc['name'];
              }
              $totalCopies += $doc['quantity'];
            }
            
            $request['document'] = implode(', ', $documentNames); // For display
            $request['documents'] = $documentNames; // Array format
            $request['documentCount'] = count($documents);
            $request['totalCopies'] = $totalCopies;
            $request['isMultipleDocument'] = count($documents) > 1 || $totalCopies > count($documents);
          } else {
            // Fallback: check if this is an old request with documentId in tblrequest
            if (isset($request['documentId']) && $request['documentId']) {
              $docSql = "SELECT name FROM tbldocument WHERE id = :documentId";
              $docStmt = $conn->prepare($docSql);
              $docStmt->bindParam(':documentId', $request['documentId']);
              $docStmt->execute();
              
              if ($docStmt->rowCount() > 0) {
                $docData = $docStmt->fetch(PDO::FETCH_ASSOC);
                $request['document'] = $docData['name'];
                $request['documents'] = [$docData['name']];
                $request['documentCount'] = 1;
                $request['totalCopies'] = 1;
                $request['isMultipleDocument'] = false;
              } else {
                $request['document'] = 'Unknown Document';
                $request['documents'] = ['Unknown Document'];
                $request['documentCount'] = 0;
                $request['totalCopies'] = 0;
                $request['isMultipleDocument'] = false;
              }
            } else {
              $request['document'] = 'Unknown Document';
              $request['documents'] = ['Unknown Document'];
              $request['documentCount'] = 0;
              $request['totalCopies'] = 0;
              $request['isMultipleDocument'] = false;
            }
          }
          
          // Calculate expected release date and days remaining
          if ($request['expectedDays']) {
            // For completed requests, show actual completion date from the status record
            if (strtolower($request['status']) === 'completed') {
              // Get the actual completion date from the status record
              $completionDateSql = "SELECT DATE(createdAt) as completionDate FROM tblrequeststatus 
                                   WHERE requestId = :requestId AND statusId = (SELECT id FROM tblstatus WHERE name = 'Completed')
                                   ORDER BY createdAt DESC LIMIT 1";
              $completionStmt = $conn->prepare($completionDateSql);
              $completionStmt->bindParam(':requestId', $request['id']);
              $completionStmt->execute();
              
              if ($completionStmt->rowCount() > 0) {
                $completionData = $completionStmt->fetch(PDO::FETCH_ASSOC);
                $completionDate = new DateTime($completionData['completionDate']);
                $request['expectedReleaseDate'] = $completionDate->format('Y-m-d');
                $request['expectedReleaseDateFormatted'] = $completionDate->format('F d, Y');
              } else {
                // Fallback to expected date if completion date not found
                $requestDate = new DateTime($request['dateRequestedFull']);
                $expectedReleaseDate = clone $requestDate;
                $expectedReleaseDate->add(new DateInterval('P' . $request['expectedDays'] . 'D'));
                $request['expectedReleaseDate'] = $expectedReleaseDate->format('Y-m-d');
                $request['expectedReleaseDateFormatted'] = $expectedReleaseDate->format('F d, Y');
              }
              
              $request['daysRemaining'] = null;
              $request['isOverdue'] = false;
            } else {
              // For non-completed requests, calculate expected release date
              // Check if there are any requirements uploaded for this request
              $requirementSql = "SELECT MAX(createdAt) as latestRequirementDate 
                               FROM tblrequirements 
                               WHERE requestId = :requestId";
              $requirementStmt = $conn->prepare($requirementSql);
              $requirementStmt->bindParam(':requestId', $request['id']);
              $requirementStmt->execute();
              
              $startDate = new DateTime($request['dateRequestedFull']); // Default to request date
              
              if ($requirementStmt->rowCount() > 0) {
                $requirementData = $requirementStmt->fetch(PDO::FETCH_ASSOC);
                if ($requirementData['latestRequirementDate']) {
                  // Use the latest requirement upload date as starting point
                  $startDate = new DateTime($requirementData['latestRequirementDate']);
                }
              }
              
              $expectedReleaseDate = clone $startDate;
              $expectedReleaseDate->add(new DateInterval('P' . $request['expectedDays'] . 'D'));
              
              $request['expectedReleaseDate'] = $expectedReleaseDate->format('Y-m-d');
              $request['expectedReleaseDateFormatted'] = $expectedReleaseDate->format('F d, Y');
              
              // Calculate days remaining
              $currentDate = new DateTime();
              $currentDate->setTime(0, 0, 0); // Set to start of day for accurate calculation
              $expectedReleaseDate->setTime(0, 0, 0);
              
              $interval = $currentDate->diff($expectedReleaseDate);
              
              if ($currentDate <= $expectedReleaseDate) {
                $request['daysRemaining'] = $interval->days;
                $request['isOverdue'] = false;
              } else {
                $request['daysRemaining'] = -$interval->days; // Negative for overdue
                $request['isOverdue'] = true;
              }
              
              // If request is cancelled, don't show countdown
              if (strtolower($request['status']) === 'cancelled') {
                $request['daysRemaining'] = null;
                $request['isOverdue'] = false;
              }
            }
          } else {
            $request['expectedReleaseDate'] = null;
            $request['expectedReleaseDateFormatted'] = null;
            $request['daysRemaining'] = null;
            $request['isOverdue'] = false;
          }
        }
        
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

  function getExpectedDays()
  {
    include "connection.php";

    try {
      $sql = "SELECT days FROM tblexpecteddays WHERE id = 1 LIMIT 1";
      $stmt = $conn->prepare($sql);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Set Philippine timezone for calculations
        date_default_timezone_set('Asia/Manila');
        
        // Calculate expected release date
        $currentDate = new DateTime();
        $expectedReleaseDate = clone $currentDate;
        $expectedReleaseDate->add(new DateInterval('P' . $result['days'] . 'D'));
        
        return json_encode([
          'days' => $result['days'],
          'expectedReleaseDate' => $expectedReleaseDate->format('Y-m-d'),
          'expectedReleaseDateFormatted' => $expectedReleaseDate->format('F d, Y')
        ]);
      }
      return json_encode(['days' => 7, 'expectedReleaseDate' => null, 'expectedReleaseDateFormatted' => null]);

    } catch (PDOException $e) {
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
                req.id,
                req.filepath,
                req.typeId,
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
        return json_encode($attachments);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getDocumentRequirements($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $documentId = $json['documentId'];

    try {
      $sql = "SELECT 
                dr.id,
                dr.documentId,
                dr.requirementTId,
                rt.nameType as requirementName,
                rt.id as requirementId
              FROM tbldocumentrequirement dr
              INNER JOIN tblrequirementstype rt ON dr.requirementTId = rt.id
              WHERE dr.documentId = :documentId
              ORDER BY rt.nameType";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':documentId', $documentId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $requirements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($requirements);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getDocumentPurposes($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $documentId = $json['documentId'];

    try {
      $sql = "SELECT 
                id,
                name,
                documentId
              FROM tblpurpose
              WHERE documentId = :documentId
              ORDER BY name";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':documentId', $documentId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $purposes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($purposes);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
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
                s.birthPlace,
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
                s.gradeLevelId,
                s.contactNo,
                sec.name as sectionName,
                sy.year as schoolYear,
                t.name as track,
                st.name as strand,
                gl.name as gradeLevel
              FROM tblstudent s
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblschoolyear sy ON s.schoolyearId = sy.id
              LEFT JOIN tblstrand st ON s.strandId = st.id
              LEFT JOIN tbltrack t ON st.trackId = t.id
              LEFT JOIN tblgradelevel gl ON s.gradeLevelId = gl.id
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
                  birthPlace = :birthPlace,
                  age = :age,
                  religion = :religion,
                  completeAddress = :completeAddress,
                  fatherName = :fatherName,
                  motherName = :motherName,
                  guardianName = :guardianName,
                  guardianRelationship = :guardianRelationship,
                  contactNo = :contactNo,
                  updatedAt = NOW()
              WHERE id = :userId";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':firstname', $json['firstname']);
      $stmt->bindParam(':middlename', $json['middlename']);
      $stmt->bindParam(':lastname', $json['lastname']);
      $stmt->bindParam(':email', $json['email']);
      $stmt->bindParam(':birthDate', $json['birthDate']);
      $stmt->bindParam(':birthPlace', $json['birthPlace']);
      $stmt->bindParam(':age', $json['age']);
      $stmt->bindParam(':religion', $json['religion']);
      $stmt->bindParam(':completeAddress', $json['completeAddress']);
      $stmt->bindParam(':fatherName', $json['fatherName']);
      $stmt->bindParam(':motherName', $json['motherName']);
      $stmt->bindParam(':guardianName', $json['guardianName']);
      $stmt->bindParam(':guardianRelationship', $json['guardianRelationship']);
      $stmt->bindParam(':contactNo', $json['contactNo']);
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

  function uploadAdditionalRequirement($json)
  {
    include "connection.php";

    $json = json_decode($json, true);

    try {
      $conn->beginTransaction();

      // Set Philippine timezone and get current datetime
      date_default_timezone_set('Asia/Manila');
      $philippineDateTime = date('Y-m-d H:i:s');

      // Validate required fields
      if (!isset($json['requestId']) || !isset($json['typeId']) || !isset($_FILES['attachment'])) {
        throw new PDOException("Missing required fields");
      }

      $requestId = $json['requestId'];
      $typeId = $json['typeId'];

      // Handle file upload
      if ($_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'requirements/';
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadDir)) {
          mkdir($uploadDir, 0777, true);
        }

        $originalFileName = $_FILES['attachment']['name'];
        $fileExtension = pathinfo($originalFileName, PATHINFO_EXTENSION);
        $filePath = $uploadDir . $originalFileName;

        // Validate file type (only images and PDFs)
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
        if (!in_array(strtolower($fileExtension), $allowedTypes)) {
          throw new PDOException("Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed.");
        }

        // Check file size (max 5MB)
        if ($_FILES['attachment']['size'] > 5 * 1024 * 1024) {
          throw new PDOException("File size too large. Maximum size is 5MB.");
        }

        if (move_uploaded_file($_FILES['attachment']['tmp_name'], $filePath)) {
          // Insert into tblrequirements
          $reqSql = "INSERT INTO tblrequirements (requestId, filepath, typeId, createdAt, isAdditional) VALUES (:requestId, :filepath, :typeId, :datetime, 1)";
          $reqStmt = $conn->prepare($reqSql);
          $reqStmt->bindParam(':requestId', $requestId);
          $reqStmt->bindParam(':filepath', $originalFileName);
          $reqStmt->bindParam(':typeId', $typeId);
          $reqStmt->bindParam(':datetime', $philippineDateTime);
          
          if ($reqStmt->execute()) {
            // Update isMarkAsRead in tblrequirementcomments
            $updateSql = "UPDATE tblrequirementcomments SET isMarkAsRead = 1 WHERE requestId = :requestId";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bindParam(':requestId', $requestId);
            $updateStmt->execute();

            $conn->commit();
            return json_encode(['success' => true, 'message' => 'Requirement uploaded successfully']);
          } else {
            throw new PDOException("Failed to save requirement to database");
          }
        } else {
          throw new PDOException("Failed to upload file");
        }
      } else {
        throw new PDOException("File upload error: " . $_FILES['attachment']['error']);
      }

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getRequirementComments($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    try {
      $sql = "SELECT 
                rc.id,
                rc.comment,
                rc.status,
                rc.createdAt,
                rc.isNotified,
                rc.isMarkAsRead,
                u.firstname as registrarFirstName,
                u.lastname as registrarLastName,
                req.filepath,
                rt.nameType as requirementType
              FROM tblrequirementcomments rc
              INNER JOIN tbluser u ON rc.registrarId = u.id
              INNER JOIN tblrequirements req ON rc.requirementId = req.id
              INNER JOIN tblrequirementstype rt ON req.typeId = rt.id
              WHERE rc.requestId = :requestId AND rc.isMarkAsRead = 0
              ORDER BY rc.createdAt DESC";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($comments);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function cancelRequest($json)
  {
    include "connection.php";

    $json = json_decode($json, true);

    try {
      $conn->beginTransaction();

      // Set Philippine timezone and get current datetime
      date_default_timezone_set('Asia/Manila');
      $philippineDateTime = date('Y-m-d H:i:s');

      // Validate required fields
      if (!isset($json['requestId'])) {
        throw new PDOException("Missing request ID");
      }

      $requestId = $json['requestId'];

      // Check if request exists and is in Pending status
      $checkSql = "SELECT r.id, s.name as statusName 
                   FROM tblrequest r
                   INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
                   INNER JOIN tblstatus s ON rs.statusId = s.id
                   WHERE r.id = :requestId
                   AND rs.id = (
                     SELECT MAX(rs2.id) 
                     FROM tblrequeststatus rs2 
                     WHERE rs2.requestId = r.id
                   )";
      
      $checkStmt = $conn->prepare($checkSql);
      $checkStmt->bindParam(':requestId', $requestId);
      $checkStmt->execute();

      if ($checkStmt->rowCount() == 0) {
        throw new PDOException("Request not found");
      }

      $requestStatus = $checkStmt->fetch(PDO::FETCH_ASSOC);
      
      // Only allow cancellation if status is Pending
      if (strtolower($requestStatus['statusName']) !== 'pending') {
        $conn->rollBack();
        return json_encode([
          'error' => 'This request is already being processed and cannot be cancelled.',
          'processed' => true,
          'message' => 'We apologize, but this document request is already being processed by our staff. You can no longer cancel this request.',
          'currentStatus' => $requestStatus['statusName']
        ]);
      }

      // Check if Cancelled status exists, if not create it
      $statusCheckSql = "SELECT id FROM tblstatus WHERE name = 'Cancelled' LIMIT 1";
      $statusCheckStmt = $conn->prepare($statusCheckSql);
      $statusCheckStmt->execute();
      
      if ($statusCheckStmt->rowCount() > 0) {
        $cancelledStatus = $statusCheckStmt->fetch(PDO::FETCH_ASSOC);
        $statusId = $cancelledStatus['id'];
      } else {
        // Create Cancelled status if it doesn't exist
        $createStatusSql = "INSERT INTO tblstatus (name, createdAt) VALUES ('Cancelled', :datetime)";
        $createStatusStmt = $conn->prepare($createStatusSql);
        $createStatusStmt->bindParam(':datetime', $philippineDateTime);
        
        if ($createStatusStmt->execute()) {
          $statusId = $conn->lastInsertId();
        } else {
          throw new PDOException("Failed to create Cancelled status");
        }
      }

      // Insert new status record with Cancelled status
      $statusSql = "INSERT INTO tblrequeststatus (requestId, statusId, createdAt) VALUES (:requestId, :statusId, :datetime)";
      $statusStmt = $conn->prepare($statusSql);
      $statusStmt->bindParam(':requestId', $requestId);
      $statusStmt->bindParam(':statusId', $statusId);
      $statusStmt->bindParam(':datetime', $philippineDateTime);

      if ($statusStmt->execute()) {
        $conn->commit();
        return json_encode(['success' => true, 'message' => 'Request cancelled successfully']);
      } else {
        throw new PDOException("Failed to cancel request");
      }

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function verifyCurrentPassword($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];
    $currentPassword = $json['currentPassword'];

    try {
      $sql = "SELECT password FROM tblstudent WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $userId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($currentPassword, $user['password'])) {
          return json_encode(['success' => true, 'message' => 'Current password verified.']);
        }
        return json_encode(['success' => false, 'error' => 'Invalid current password.']);
      }
      return json_encode(['success' => false, 'error' => 'User not found.']);
    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function resetPassword($json) {
    include "connection.php";

    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $newPassword = isset($json['newPassword']) ? $json['newPassword'] : null;

    try {
      $conn->beginTransaction();
      
      if (empty($newPassword)) {
          return json_encode(['status' => 'error', 'message' => 'No new password provided for update']);
      }
      
      $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
      $sql = "UPDATE tblstudent SET password = :password WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':password', $hashedPassword);
      $stmt->bindParam(':userId', $userId);
      
      if ($stmt->execute()) {
          $conn->commit();
          return json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
      } else {
          $conn->rollBack();
          return json_encode(['status' => 'error', 'message' => 'Failed to reset password']);
      }
    } catch (Exception $e) {
        $conn->rollBack();
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
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
  case "addMultipleDocumentRequest":
    echo $user->addMultipleDocumentRequest($json);
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
  case "getExpectedDays":
    echo $user->getExpectedDays();
    break;
  case "getRequestAttachments":
    echo $user->getRequestAttachments($json);
    break;
  case "getDocumentRequirements":
    echo $user->getDocumentRequirements($json);
    break;
  case "getDocumentPurposes":
    echo $user->getDocumentPurposes($json);
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
  case "uploadAdditionalRequirement":
    echo $user->uploadAdditionalRequirement($json);
    break;
  case "getRequirementComments":
    echo $user->getRequirementComments($json);
    break;
  case "cancelRequest":
    echo $user->cancelRequest($json);
    break;
  case "verifyCurrentPassword": // New case for verifying current password
    echo $user->verifyCurrentPassword($json);
    break;
  case "resetPassword": // New case for resetting password (used by changePassword)
    echo $user->resetPassword($json);
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>