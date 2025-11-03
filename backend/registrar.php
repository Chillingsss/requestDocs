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
        
        // For each request, get the associated documents from tblrequestdocument
        foreach ($requests as &$request) {
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
            
            foreach ($documents as $doc) {
              if ($doc['quantity'] > 1) {
                $documentNames[] = $doc['name'] . ' (' . $doc['quantity'] . ' copies)';
              } else {
                $documentNames[] = $doc['name'];
              }
            }
            
            $request['document'] = implode(', ', $documentNames);
          } else {
            $request['document'] = 'Unknown Document';
          }
        }
        
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
                r.purpose,
                DATE(r.createdAt) as dateRequested,
                r.createdAt as dateRequestedFull,
                s.name as status,
                s.id as statusId,
                rs_schedule.dateSchedule as releaseDate,
                DATE_FORMAT(rs_schedule.dateSchedule, '%M %d, %Y') as releaseDateFormatted,
                CASE 
                  WHEN r.purpose IS NOT NULL THEN r.purpose
                  WHEN EXISTS (SELECT 1 FROM tblrequestpurpose rp WHERE rp.requestId = r.id) THEN 
                    (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') 
                     FROM tblrequestpurpose rp 
                     INNER JOIN tblpurpose p ON rp.purposeId = p.id 
                     WHERE rp.requestId = r.id)
                  ELSE 'No purpose specified'
                END as displayPurpose,
                -- Calculate expected release date and days remaining
                -- For completed requests, show actual completion date
                -- For release status, use scheduled date if available
                -- For other statuses, calculate from request date
                CASE 
                  WHEN s.name = 'Completed' THEN DATE(rs.createdAt)
                  WHEN s.name = 'Release' AND rs_schedule.dateSchedule IS NOT NULL THEN rs_schedule.dateSchedule
                  ELSE DATE_ADD(
                    COALESCE(
                      (SELECT MAX(DATE(createdAt)) FROM tblrequirements WHERE requestId = r.id),
                      DATE(r.createdAt)
                    ), 
                    INTERVAL (SELECT COALESCE(days, 7) FROM tblexpecteddays WHERE id = 1 LIMIT 1) DAY
                  )
                END as expectedReleaseDate,
                DATE_FORMAT(
                  CASE 
                    WHEN s.name = 'Completed' THEN DATE(rs.createdAt)
                    WHEN s.name = 'Release' AND rs_schedule.dateSchedule IS NOT NULL THEN rs_schedule.dateSchedule
                    ELSE DATE_ADD(
                      COALESCE(
                        (SELECT MAX(DATE(createdAt)) FROM tblrequirements WHERE requestId = r.id),
                        DATE(r.createdAt)
                      ), 
                      INTERVAL (SELECT COALESCE(days, 7) FROM tblexpecteddays WHERE id = 1 LIMIT 1) DAY
                    )
                  END, 
                  '%M %d, %Y'
                ) as expectedReleaseDateFormatted,
                -- For completed requests, set daysRemaining to null; otherwise calculate normally
                CASE 
                  WHEN s.name = 'Completed' THEN NULL
                  ELSE DATEDIFF(
                    CASE 
                      WHEN s.name = 'Release' AND rs_schedule.dateSchedule IS NOT NULL THEN rs_schedule.dateSchedule
                      ELSE DATE_ADD(
                        COALESCE(
                          (SELECT MAX(DATE(createdAt)) FROM tblrequirements WHERE requestId = r.id),
                          DATE(r.createdAt)
                        ), 
                        INTERVAL (SELECT COALESCE(days, 7) FROM tblexpecteddays WHERE id = 1 LIMIT 1) DAY
                      )
                    END,
                    CURDATE()
                  )
                END as daysRemaining,
                (SELECT COALESCE(days, 7) FROM tblexpecteddays WHERE id = 1 LIMIT 1) as expectedDays,
                -- Count additional requirements that haven't been viewed
                (SELECT COUNT(*) 
                 FROM tblrequirements req 
                 WHERE req.requestId = r.id AND req.isAdditional = 1) as hasAdditionalRequirements,
                -- Get the registrar who first processed this request (first non-null userId)
                (SELECT CONCAT(reg.firstname, ' ', reg.lastname) 
                 FROM tblrequeststatus rs_owner 
                 INNER JOIN tbluser reg ON rs_owner.userId = reg.id
                 WHERE rs_owner.requestId = r.id AND rs_owner.userId IS NOT NULL 
                 ORDER BY rs_owner.id ASC LIMIT 1) as processedBy
              FROM tblrequest r
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              INNER JOIN tblstudent u ON r.studentId = u.id
              LEFT JOIN tblreleaseschedule rs_schedule ON r.id = rs_schedule.requestId
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
            $request['document'] = 'Unknown Document';
            $request['documents'] = ['Unknown Document'];
            $request['documentCount'] = 0;
            $request['totalCopies'] = 0;
            $request['isMultipleDocument'] = false;
          }
        }
        
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
    $userId = $json['userId'] ?? null;
    
    // Set Philippine timezone and get current datetime
    date_default_timezone_set('Asia/Manila');
    $datetime = date('Y-m-d H:i:s');

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
      $currentStatusName = $currentStatus['statusName'];
      
      // Check if request is cancelled - if so, prevent any processing
      if (strtolower($currentStatusName) === 'cancelled') {
        $conn->rollBack();
        return json_encode([
          'error' => 'This request has been cancelled by the student and cannot be processed.',
          'cancelled' => true,
          'message' => 'We apologize, but this document request has been cancelled by the student. Please refresh the page to see the updated status.'
        ]);
      }
      
      // Check registrar ownership - only allow processing if:
      // 1. Request is in Pending status (anyone can start processing), OR
      // 2. Request is already being processed by the same registrar
      if ($currentStatusId != 1) { // Not Pending status
        // Get the registrar who first processed this request (first non-null userId)
        $ownershipSql = "SELECT userId FROM tblrequeststatus 
                        WHERE requestId = :requestId AND userId IS NOT NULL 
                        ORDER BY id ASC LIMIT 1";
        $ownershipStmt = $conn->prepare($ownershipSql);
        $ownershipStmt->bindParam(':requestId', $requestId);
        $ownershipStmt->execute();
        
        if ($ownershipStmt->rowCount() > 0) {
          $originalRegistrar = $ownershipStmt->fetch(PDO::FETCH_ASSOC)['userId'];
          
          // Check if current user is the same as the original registrar
          if ($originalRegistrar !== $userId) {
            // Get the registrar's name for better error message
            $registrarNameSql = "SELECT firstname, lastname FROM tbluser WHERE id = :registrarId";
            $registrarNameStmt = $conn->prepare($registrarNameSql);
            $registrarNameStmt->bindParam(':registrarId', $originalRegistrar);
            $registrarNameStmt->execute();
            
            $registrarName = "Unknown Registrar";
            if ($registrarNameStmt->rowCount() > 0) {
              $registrarData = $registrarNameStmt->fetch(PDO::FETCH_ASSOC);
              $registrarName = $registrarData['firstname'] . ' ' . $registrarData['lastname'];
            }
            
            $conn->rollBack();
            return json_encode([
              'error' => 'Access denied: This request is already being processed by another registrar. Only the original processing registrar can continue with this request.',
              'processedBy' => $registrarName
            ]);
          }
        }
      }
      
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
      $sql = "INSERT INTO tblrequeststatus (requestId, statusId, userId, createdAt) VALUES (:requestId, :statusId, :userId, :datetime)";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->bindParam(':statusId', $nextStatusId);
      $stmt->bindParam(':userId', $userId);
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
      // First get the student ID and current grade level
      $studentSql = "SELECT r.studentId, s.gradeLevelId as currentGradeLevelId
                     FROM tblrequest r
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
      $currentGradeLevelId = $requestData['currentGradeLevelId'];

      // Get all documents for this request from tblrequestdocument
      $docSql = "SELECT rd.documentId, d.name as requestedDocumentType
                 FROM tblrequestdocument rd
                 INNER JOIN tbldocument d ON rd.documentId = d.id
                 WHERE rd.requestId = :requestId";
      $docStmt = $conn->prepare($docSql);
      $docStmt->bindParam(':requestId', $requestId);
      $docStmt->execute();
      
      if ($docStmt->rowCount() == 0) {
        return json_encode(['error' => 'No documents found for this request']);
      }
      
      $requestDocuments = $docStmt->fetchAll(PDO::FETCH_ASSOC);
      $allStudentDocuments = [];
      
      // Process each document type in the request
      foreach ($requestDocuments as $reqDoc) {
        $documentId = $reqDoc['documentId'];
        $isSf10Request = strtolower($reqDoc['requestedDocumentType']) === 'sf10';

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
          
          // Add these documents to the overall collection
          $allStudentDocuments = array_merge($allStudentDocuments, $validDocuments);
        }
      }
      
      return json_encode($allStudentDocuments);

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
                GROUP_CONCAT(DISTINCT d.name) as requestedDocuments,
                GROUP_CONCAT(DISTINCT sd.gradeLevelId) as documentGradeLevels,
                GROUP_CONCAT(DISTINCT sd.fileName) as documentFiles
              FROM tblrequest r
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblgradelevel gl ON sec.gradeLevelId = gl.id
              LEFT JOIN tblrequestdocument rd ON r.id = rd.requestId
              LEFT JOIN tbldocument d ON rd.documentId = d.id
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
                s.completeAddress,
                s.contactNo,
                s.birthPlace,
                s.birthDate,
                sec.gradeLevelId,
                gl.name as gradeLevel,
                sy.year as schoolYear,
                r.id as requestId
              FROM tblrequest r
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblstrand st ON s.strandId = st.id
              LEFT JOIN tbltrack t ON st.trackId = t.id
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblgradelevel gl ON sec.gradeLevelId = gl.id
              LEFT JOIN tblschoolyear sy ON s.schoolyearId = sy.id
              WHERE r.id = :requestId ORDER BY s.createdAt ASC";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $studentInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get documents from tblrequestdocument (works for both single and multiple document requests)
        $docSql = "SELECT rd.documentId FROM tblrequestdocument rd WHERE rd.requestId = :requestId";
        $docStmt = $conn->prepare($docSql);
        $docStmt->bindParam(':requestId', $requestId);
        $docStmt->execute();
        $documents = $docStmt->fetchAll(PDO::FETCH_COLUMN);
        $studentInfo['documentIds'] = $documents;
        
        // Get control number for CAV documents (count of completed CAV requests)
        $isCavRequest = in_array(7, $documents); // 7 is CAV document ID
        
        if ($isCavRequest) {
          $controlSql = "SELECT COUNT(*) as controlNo 
                        FROM tblrequest r
                        INNER JOIN tblrequestdocument rd ON r.id = rd.requestId
                        INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
                        INNER JOIN tblstatus st ON rs.statusId = st.id
                        WHERE rd.documentId = 7 AND st.name = 'Completed' AND r.id <= :requestId
                        ORDER BY r.id";
          $controlStmt = $conn->prepare($controlSql);
          $controlStmt->bindParam(':requestId', $requestId);
          $controlStmt->execute();
          $controlResult = $controlStmt->fetch(PDO::FETCH_ASSOC);
          // Add +1 to the completed CAV count to get the next control number
          $completedCount = isset($controlResult['controlNo']) ? (int)$controlResult['controlNo'] : 0;
          $studentInfo['controlNo'] = $completedCount + 1;
        }
        
        // Get request purposes
        $purposeSql = "SELECT p.name as purposeName 
                      FROM tblrequestpurpose rp
                      INNER JOIN tblpurpose p ON rp.purposeId = p.id
                      WHERE rp.requestId = :requestId";
        $purposeStmt = $conn->prepare($purposeSql);
        $purposeStmt->bindParam(':requestId', $requestId);
        $purposeStmt->execute();
        $purposes = $purposeStmt->fetchAll(PDO::FETCH_ASSOC);
        $studentInfo['purposes'] = $purposes;
        
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
    $userId = $json['userId'] ?? null;

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

      // Check if request is cancelled - if so, prevent any updates
      $statusCheckSql = "SELECT s.name as statusName
                        FROM tblrequeststatus rs
                        INNER JOIN tblstatus s ON rs.statusId = s.id
                        WHERE rs.requestId = :requestId
                        ORDER BY rs.id DESC
                        LIMIT 1";
      $statusCheckStmt = $conn->prepare($statusCheckSql);
      $statusCheckStmt->bindParam(':requestId', $requestId);
      $statusCheckStmt->execute();
      
      if ($statusCheckStmt->rowCount() > 0) {
        $statusData = $statusCheckStmt->fetch(PDO::FETCH_ASSOC);
        if (strtolower($statusData['statusName']) === 'cancelled') {
          return json_encode([
            'error' => 'This request has been cancelled by the student and cannot be updated.',
            'cancelled' => true,
            'message' => 'We apologize, but this document request has been cancelled by the student. Please refresh the page to see the updated status.'
          ]);
        }
      }

      // Check registrar ownership - only the original processing registrar can update student info
      $ownershipSql = "SELECT userId FROM tblrequeststatus 
                      WHERE requestId = :requestId AND userId IS NOT NULL 
                      ORDER BY id ASC LIMIT 1";
      $ownershipStmt = $conn->prepare($ownershipSql);
      $ownershipStmt->bindParam(':requestId', $requestId);
      $ownershipStmt->execute();
      
      if ($ownershipStmt->rowCount() > 0) {
        $originalRegistrar = $ownershipStmt->fetch(PDO::FETCH_ASSOC)['userId'];
        
        // Check if current user is the same as the original registrar
        if ($originalRegistrar !== $userId) {
          // Get the registrar's name for better error message
          $registrarNameSql = "SELECT firstname, lastname FROM tbluser WHERE id = :registrarId";
          $registrarNameStmt = $conn->prepare($registrarNameSql);
          $registrarNameStmt->bindParam(':registrarId', $originalRegistrar);
          $registrarNameStmt->execute();
          
          $registrarName = "Unknown Registrar";
          if ($registrarNameStmt->rowCount() > 0) {
            $registrarData = $registrarNameStmt->fetch(PDO::FETCH_ASSOC);
            $registrarName = $registrarData['firstname'] . ' ' . $registrarData['lastname'];
          }
          
          return json_encode([
            'error' => 'Access denied: This request is already being processed by another registrar. Only the original processing registrar can update student information.',
            'processedBy' => $registrarName
          ]);
        }
      }

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

  function getAllStudentFiles(){
    include "connection.php";

    try {
      // Query for Excel files from tblsfrecord
      $sql1 = "SELECT 
                sf.id,
                sf.fileName,
                sf.studentId,
                sf.gradeLevelId,
                sf.createdAt,
                gl.name as gradeLevelName,
                s.firstname,
                s.lastname,
                s.middlename,
                s.lrn,
                t.name as track,
                st.name as strand,
                'Excel File' as documentType,
                'sfrecord' as sourceTable
              FROM tblsfrecord sf
              LEFT JOIN tblgradelevel gl ON sf.gradeLevelId = gl.id
              LEFT JOIN tblstudent s ON sf.studentId = s.id
              LEFT JOIN tbltrack t ON s.strandId IN (SELECT id FROM tblstrand WHERE trackId = t.id)
              LEFT JOIN tblstrand st ON s.strandId = st.id";

      // Query for PDF files from tblstudentdocument
      $sql2 = "SELECT 
                sd.id,
                sd.fileName,
                sd.studentId,
                sd.gradeLevelId,
                sd.createdAt,
                gl.name as gradeLevelName,
                s.firstname,
                s.lastname,
                s.middlename,
                s.lrn,
                t.name as track,
                st.name as strand,
                CASE 
                  WHEN sd.fileName LIKE '%.pdf' THEN 'PDF File'
                  ELSE 'Document'
                END as documentType,
                'studentdocument' as sourceTable
              FROM tblstudentdocument sd
              LEFT JOIN tblgradelevel gl ON sd.gradeLevelId = gl.id
              LEFT JOIN tblstudent s ON sd.studentId = s.id
              LEFT JOIN tbltrack t ON s.strandId IN (SELECT id FROM tblstrand WHERE trackId = t.id)
              LEFT JOIN tblstrand st ON s.strandId = st.id";

      // Combine both queries with UNION
      $sql = "($sql1) UNION ALL ($sql2) ORDER BY lastname ASC, firstname ASC, createdAt DESC";
      
      $stmt = $conn->prepare($sql);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Filter files to only include those that actually exist in the filesystem
        $validFiles = [];
        foreach ($files as $file) {
          $filePath = __DIR__ . '/documents/' . $file['fileName'];
          if (file_exists($filePath)) {
            $validFiles[] = $file;
          }
        }
        
        // Group files by student
        $groupedFiles = [];
        foreach ($validFiles as $file) {
          $studentId = $file['studentId'];
          if (!isset($groupedFiles[$studentId])) {
            $groupedFiles[$studentId] = [
              'studentId' => $file['studentId'],
              'firstname' => $file['firstname'],
              'lastname' => $file['lastname'],
              'middlename' => $file['middlename'],
              'lrn' => $file['lrn'],
              'track' => $file['track'],
              'strand' => $file['strand'],
              'gradeLevelId' => $file['gradeLevelId'],
              'gradeLevelName' => $file['gradeLevelName'],
              'files' => []
            ];
          }
          $groupedFiles[$studentId]['files'][] = [
            'id' => $file['id'],
            'fileName' => $file['fileName'],
            'documentType' => $file['documentType'],
            'sourceTable' => $file['sourceTable'],
            'createdAt' => $file['createdAt']
          ];
        }
        
        // Convert to indexed array and sort by student name
        $result = array_values($groupedFiles);
        usort($result, function($a, $b) {
          return strcmp($a['lastname'] . $a['firstname'], $b['lastname'] . $b['firstname']);
        });
        
        return json_encode($result);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
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

  function uploadSingleStudentDocument() {
    include "connection.php";
    try {
      $studentId = $_POST['studentId'];
      $documentType = $_POST['documentType'];
      $gradeLevelId = $_POST['gradeLevelId'];
      $uploadDir = 'documents/';
      
      if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        return json_encode([
          'success' => false,
          'message' => 'No file uploaded or upload error occurred'
        ]);
      }

      $fileName = $_FILES['document']['name'];
      $fileTmpName = $_FILES['document']['tmp_name'];
      $fileSize = $_FILES['document']['size'];

      // Validate file type - only PDF
      $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
      if (strtolower($fileExtension) !== 'pdf') {
        return json_encode([
          'success' => false,
          'message' => 'Invalid file type. Only PDF files are allowed.'
        ]);
      }

      // Check file size (max 10MB)
      if ($fileSize > 10 * 1024 * 1024) {
        return json_encode([
          'success' => false,
          'message' => 'File size too large. Maximum size is 10MB.'
        ]);
      }

      // Get student lastname
      $studentSql = "SELECT lastname FROM tblstudent WHERE id = :studentId";
      $studentStmt = $conn->prepare($studentSql);
      $studentStmt->bindParam(':studentId', $studentId);
      $studentStmt->execute();
      $studentData = $studentStmt->fetch(PDO::FETCH_ASSOC);
      $studentLastname = $studentData ? str_replace(' ', '', $studentData['lastname']) : 'Unknown';
      
      // Get selected grade level name
      $gradeLevelSql = "SELECT name FROM tblgradelevel WHERE id = :gradeLevelId";
      $gradeLevelStmt = $conn->prepare($gradeLevelSql);
      $gradeLevelStmt->bindParam(':gradeLevelId', $gradeLevelId);
      $gradeLevelStmt->execute();
      $gradeLevelData = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
      $gradeLevelName = $gradeLevelData ? str_replace(' ', '', $gradeLevelData['name']) : 'Unknown';

      // Generate filename with format: LRN-GradeLevel-Lastname.pdf (same as teacher.php)
      $uniqueId = str_pad($studentId, 8, '0', STR_PAD_LEFT);
      $uniqueFileName = $uniqueId . '-' . $gradeLevelName . '-' . $studentLastname . '.' . $fileExtension;
      $filePath = $uploadDir . $uniqueFileName;

      if (move_uploaded_file($fileTmpName, $filePath)) {
        // Use the provided grade level ID from the form
        
        // Insert document record with grade level
        $insertSql = "INSERT INTO tblstudentdocument (studentId, documentId, fileName, gradeLevelId, createdAt) 
                     VALUES (:studentId, :documentId, :fileName, :gradeLevelId, NOW())";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bindParam(':studentId', $studentId);
        $insertStmt->bindParam(':documentId', $documentType);
        $insertStmt->bindParam(':fileName', $uniqueFileName);
        $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);

        if ($insertStmt->execute()) {
          return json_encode([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'fileName' => $uniqueFileName,
            'studentId' => $studentId,
            'gradeLevelId' => $gradeLevelId
          ]);
        } else {
          unlink($filePath);
          return json_encode([
            'success' => false,
            'message' => 'Database error while saving document record'
          ]);
        }
      } else {
        return json_encode([
          'success' => false,
          'message' => 'Failed to upload file to server'
        ]);
      }

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

  function getGradeLevels() {
    include "connection.php";
    $sql = "SELECT id, name FROM tblgradelevel ORDER BY id ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
      $gradeLevels = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($gradeLevels);
    }
    return json_encode([]);
  }

  function getSectionsByGradeLevel($json) {
    include "connection.php";
    
    $json = json_decode($json, true);
    $gradeLevelId = $json['gradeLevelId'];
    
    try {
      $sql = "SELECT s.id, s.name, s.gradeLevelId, gl.name as gradeLevelName 
              FROM tblsection s 
              LEFT JOIN tblgradelevel gl ON s.gradeLevelId = gl.id 
              WHERE s.gradeLevelId = :gradeLevelId 
              ORDER BY s.name ASC";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':gradeLevelId', $gradeLevelId);
      $stmt->execute();
      
      if ($stmt->rowCount() > 0) {
        $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($sections);
      }
      return json_encode([]);
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
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
    $userId = $json['userId'] ?? null;
    
    // Debug logging
    error_log("processRelease called with requestId: " . $requestId);
    
    // Set Philippine timezone and get current datetime
    date_default_timezone_set('Asia/Manila');
    $datetime = date('Y-m-d H:i:s');

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
      
      // Check if request is cancelled - if so, prevent any processing
      if (strtolower($currentStatus['statusName']) === 'cancelled') {
        $conn->rollBack();
        return json_encode([
          'error' => 'This request has been cancelled by the student and cannot be released.',
          'cancelled' => true,
          'message' => 'We apologize, but this document request has been cancelled by the student. Please refresh the page to see the updated status.'
        ]);
      }
      
      if ($currentStatus['statusId'] != 3) { // 3 = Signatory
        $conn->rollBack();
        error_log("Request " . $requestId . " is not in Signatory status. Current status: " . $currentStatus['statusId']);
        return json_encode(['error' => 'Request must be in Signatory status to be released']);
      }

      // Check registrar ownership - only the original processing registrar can release
      $ownershipSql = "SELECT userId FROM tblrequeststatus 
                      WHERE requestId = :requestId AND userId IS NOT NULL 
                      ORDER BY id ASC LIMIT 1";
      $ownershipStmt = $conn->prepare($ownershipSql);
      $ownershipStmt->bindParam(':requestId', $requestId);
      $ownershipStmt->execute();
      
      if ($ownershipStmt->rowCount() > 0) {
        $originalRegistrar = $ownershipStmt->fetch(PDO::FETCH_ASSOC)['userId'];
        
        // Check if current user is the same as the original registrar
        if ($originalRegistrar !== $userId) {
          // Get the registrar's name for better error message
          $registrarNameSql = "SELECT firstname, lastname FROM tblregistrar WHERE id = :registrarId";
          $registrarNameStmt = $conn->prepare($registrarNameSql);
          $registrarNameStmt->bindParam(':registrarId', $originalRegistrar);
          $registrarNameStmt->execute();
          
          $registrarName = "Unknown Registrar";
          if ($registrarNameStmt->rowCount() > 0) {
            $registrarData = $registrarNameStmt->fetch(PDO::FETCH_ASSOC);
            $registrarName = $registrarData['firstname'] . ' ' . $registrarData['lastname'];
          }
          
          $conn->rollBack();
          return json_encode([
            'error' => 'Access denied: This request is already being processed by another registrar. Only the original processing registrar can release this request.',
            'processedBy' => $registrarName
          ]);
        }
      }

      // Change status to Release (statusId = 4)
      $sql = "INSERT INTO tblrequeststatus (requestId, statusId, userId, createdAt) VALUES (:requestId, :statusId, :userId, :datetime)";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      $statusId = 4; // Release status
      $stmt->bindParam(':statusId', $statusId);
      $stmt->bindParam(':userId', $userId);
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
      
      // Check registrar ownership - only the original processing registrar can schedule release
      $ownershipSql = "SELECT userId FROM tblrequeststatus 
                      WHERE requestId = :requestId AND userId IS NOT NULL 
                      ORDER BY id ASC LIMIT 1";
      $ownershipStmt = $conn->prepare($ownershipSql);
      $ownershipStmt->bindParam(':requestId', $requestId);
      $ownershipStmt->execute();
      
      if ($ownershipStmt->rowCount() > 0) {
        $originalRegistrar = $ownershipStmt->fetch(PDO::FETCH_ASSOC)['userId'];
        
        // Check if current user is the same as the original registrar
        if ($originalRegistrar !== $userId) {
          // Get the registrar's name for better error message
          $registrarNameSql = "SELECT firstname, lastname FROM tbluser WHERE id = :registrarId";
          $registrarNameStmt = $conn->prepare($registrarNameSql);
          $registrarNameStmt->bindParam(':registrarId', $originalRegistrar);
          $registrarNameStmt->execute();
          
          $registrarName = "Unknown Registrar";
          if ($registrarNameStmt->rowCount() > 0) {
            $registrarData = $registrarNameStmt->fetch(PDO::FETCH_ASSOC);
            $registrarName = $registrarData['firstname'] . ' ' . $registrarData['lastname'];
          }
          
          $conn->rollBack();
          return json_encode([
            'error' => 'Access denied: This request is already being processed by another registrar. Only the original processing registrar can schedule the release.',
            'processedBy' => $registrarName
          ]);
        }
      }
      
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

      $conn->commit();
      
      return json_encode([
        'success' => true, 
        'message' => 'Release schedule set successfully for ' . date('F j, Y', strtotime($releaseDate)),
        'requestData' => $requestData
      ]);

    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
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
  $birthDate = $json['birthDate'];
  
  try {
    $sql = "INSERT INTO tblforgotlrn (firstname, lastname, email, birthDate) 
            VALUES (:firstname, :lastname, :email, :birthDate)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':firstname', $firstname);
    $stmt->bindParam(':lastname', $lastname);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':birthDate', $birthDate);
    
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
    
    $conn->commit();
    return json_encode([
      'success' => true,
      'message' => 'Request processed successfully',
      'requestData' => $requestData,
      'lrn' => $lrn
    ]);
    
  } catch (PDOException $e) {
    $conn->rollBack();
    return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
  }
}

function rejectLrnRequest($json)
{
  include "connection.php";
  
  $json = json_decode($json, true);
  $requestId = $json['requestId'];
  $userId = $json['userId'];
  $reason = isset($json['reason']) ? $json['reason'] : null;
  
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
    
    // Update request status to rejected (is_processed = 2)
    $updateSql = "UPDATE tblforgotlrn 
                  SET is_processed = 2, 
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
    
    $conn->commit();
    return json_encode([
      'success' => true,
      'message' => 'Request rejected successfully',
      'requestData' => $requestData
    ]);
    
  } catch (PDOException $e) {
    $conn->rollBack();
    return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
  }
}

  // Add requirement comment
  function addRequirementComment($json)
  {
    include "connection.php";
    
    $json = json_decode($json, true);
    $requirementId = $json['requirementId'];
    $requestId = $json['requestId'];
    $registrarId = $json['registrarId'];
    $comment = $json['comment'];
    
    try {
      $conn->beginTransaction();
      
      // Insert the comment
      $insertSql = "INSERT INTO tblrequirementcomments (requirementId, requestId, registrarId, comment, status, createdAt) 
                    VALUES (:requirementId, :requestId, :registrarId, :comment, 'pending', NOW())";
      
      $insertStmt = $conn->prepare($insertSql);
      $insertStmt->bindParam(':requirementId', $requirementId);
      $insertStmt->bindParam(':requestId', $requestId);
      $insertStmt->bindParam(':registrarId', $registrarId);
      $insertStmt->bindParam(':comment', $comment);
      
      if (!$insertStmt->execute()) {
        $conn->rollBack();
        return json_encode(['error' => 'Failed to add comment']);
      }
      
      $commentId = $conn->lastInsertId();
      
      // Get student information for email
      $studentSql = "SELECT 
                      s.firstname, s.lastname, s.email, s.middlename,
                      r.purpose,
                      CASE 
                        WHEN r.purpose IS NOT NULL THEN r.purpose
                        WHEN EXISTS (SELECT 1 FROM tblrequestpurpose rp WHERE rp.requestId = r.id) THEN 
                          (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') 
                           FROM tblrequestpurpose rp 
                           INNER JOIN tblpurpose p ON rp.purposeId = p.id 
                           WHERE rp.requestId = r.id)
                        ELSE 'No purpose specified'
                      END as displayPurpose,
                      CASE 
                        WHEN EXISTS (SELECT 1 FROM tblrequestdocument rd WHERE rd.requestId = r.id) THEN 
                          (SELECT GROUP_CONCAT(d.name SEPARATOR ', ') 
                           FROM tblrequestdocument rd 
                           INNER JOIN tbldocument d ON rd.documentId = d.id 
                           WHERE rd.requestId = r.id)
                        ELSE 'Unknown Document'
                      END as documentName
                    FROM tblrequest r
                    INNER JOIN tblstudent s ON r.studentId = s.id
                    WHERE r.id = :requestId";
      
      $studentStmt = $conn->prepare($studentSql);
      $studentStmt->bindParam(':requestId', $requestId);
      $studentStmt->execute();
      
      if ($studentStmt->rowCount() > 0) {
        $studentData = $studentStmt->fetch(PDO::FETCH_ASSOC);
        
        // Get requirement details
        $reqSql = "SELECT req.filepath, rt.nameType as requirementType
                   FROM tblrequirements req
                   LEFT JOIN tblrequirementstype rt ON req.typeId = rt.id
                   WHERE req.id = :requirementId";
        
        $reqStmt = $conn->prepare($reqSql);
        $reqStmt->bindParam(':requirementId', $requirementId);
        $reqStmt->execute();
        
        $requirementData = $reqStmt->fetch(PDO::FETCH_ASSOC);
        
        // Send email notification
        $emailSent = $this->sendRequirementCommentEmail($studentData, $requirementData, $comment);
        
        if ($emailSent) {
          // Update notification status
          $updateSql = "UPDATE tblrequirementcomments SET isNotified = 1 WHERE id = :commentId";
          $updateStmt = $conn->prepare($updateSql);
          $updateStmt->bindParam(':commentId', $commentId);
          $updateStmt->execute();
        }
      }
      
      $conn->commit();
      return json_encode([
        'success' => true, 
        'message' => 'Comment added successfully',
        'commentId' => $commentId,
        'emailSent' => $emailSent ?? false
      ]);
      
    } catch (PDOException $e) {
      $conn->rollBack();
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  // Get requirement comments for a request
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
                u.firstname as registrarFirstName,
                u.lastname as registrarLastName,
                req.filepath,
                rt.nameType as requirementType
              FROM tblrequirementcomments rc
              INNER JOIN tbluser u ON rc.registrarId = u.id
              INNER JOIN tblrequirements req ON rc.requirementId = req.id
              LEFT JOIN tblrequirementstype rt ON req.typeId = rt.id
              WHERE rc.requestId = :requestId
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

  // Update comment status
  function updateCommentStatus($json)
  {
    include "connection.php";
    
    $json = json_decode($json, true);
    $commentId = $json['commentId'];
    $status = $json['status'];
    
    try {
      $sql = "UPDATE tblrequirementcomments 
              SET status = :status, updatedAt = NOW() 
              WHERE id = :commentId";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':status', $status);
      $stmt->bindParam(':commentId', $commentId);
      
      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Comment status updated successfully']);
      } else {
        return json_encode(['error' => 'Failed to update comment status']);
      }
      
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
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
        return json_encode(['success' => true, 'days' => $result['days']]);
      } else {
        return json_encode(['success' => true, 'days' => 7]); // Default to 7 days
      }
    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  // Mark additional requirements as viewed
  function markAdditionalRequirementsViewed($json)
  {
    include "connection.php";
    
    $json = json_decode($json, true);
    $requestId = $json['requestId'];
    
    try {
      $sql = "UPDATE tblrequirements 
              SET isAdditional = 0 
              WHERE requestId = :requestId AND isAdditional = 1";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':requestId', $requestId);
      
      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Additional requirements marked as viewed']);
      } else {
        return json_encode(['error' => 'Failed to update additional requirements status']);
      }
      
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  // Get request owner information
  function getRequestOwner($json)
  {
    include "connection.php";

    $json = json_decode($json, true);
    $requestId = $json['requestId'];

    // Debug logging
    error_log("getRequestOwner called with requestId: " . $requestId);

    try {
      // Get the registrar who first processed this request (first non-null userId)
      $ownershipSql = "SELECT rs.userId, rs.createdAt as processedAt
                      FROM tblrequeststatus rs 
                      WHERE rs.requestId = :requestId AND rs.userId IS NOT NULL 
                      ORDER BY rs.id ASC LIMIT 1";
      $ownershipStmt = $conn->prepare($ownershipSql);
      $ownershipStmt->bindParam(':requestId', $requestId);
      $ownershipStmt->execute();
      
      error_log("Ownership query row count: " . $ownershipStmt->rowCount());
      
      // Also check all status records for this request for debugging
      $debugSql = "SELECT rs.id, rs.userId, rs.createdAt, s.name as statusName 
                   FROM tblrequeststatus rs 
                   LEFT JOIN tblstatus s ON rs.statusId = s.id
                   WHERE rs.requestId = :requestId 
                   ORDER BY rs.id ASC";
      $debugStmt = $conn->prepare($debugSql);
      $debugStmt->bindParam(':requestId', $requestId);
      $debugStmt->execute();
      
      $allStatuses = $debugStmt->fetchAll(PDO::FETCH_ASSOC);
      error_log("All status records for request " . $requestId . ": " . json_encode($allStatuses));
      
      if ($ownershipStmt->rowCount() > 0) {
        $ownershipData = $ownershipStmt->fetch(PDO::FETCH_ASSOC);
        $registrarId = $ownershipData['userId'];
        $processedAt = $ownershipData['processedAt'];
        
        error_log("Found owner: " . $registrarId . " at " . $processedAt);
        
        // Get the registrar's name
        $registrarNameSql = "SELECT firstname, lastname FROM tbluser WHERE id = :registrarId";
        $registrarNameStmt = $conn->prepare($registrarNameSql);
        $registrarNameStmt->bindParam(':registrarId', $registrarId);
        $registrarNameStmt->execute();
        
        if ($registrarNameStmt->rowCount() > 0) {
          $registrarData = $registrarNameStmt->fetch(PDO::FETCH_ASSOC);
          $registrarName = $registrarData['firstname'] . ' ' . $registrarData['lastname'];
          
          return json_encode([
            'success' => true,
            'owner' => $registrarName,
            'ownerId' => $registrarId,
            'processedAt' => $processedAt
          ]);
        }
      }
      
      return json_encode([
        'success' => true,
        'owner' => null,
        'ownerId' => null,
        'processedAt' => null,
        'debug' => $allStatuses
      ]);
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  // Send email notification for requirement comments
  function sendRequirementCommentEmail($studentData, $requirementData, $comment)
  {
    try {
      include_once "vendor/autoload.php";
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
      $mail->addAddress($studentData['email'], $studentData['firstname'] . ' ' . $studentData['lastname']);
      
      // Content
      $mail->isHTML(true);
      $mail->Subject = EMAIL_SUBJECT_PREFIX . 'Document Requirement Issue';
      
      $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <div style='background-color: #dc3545; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin: 0;'>MOGCHS Registrar Office</h1>
          </div>
          
          <div style='padding: 30px; background-color: #f9f9f9;'>
            <h2 style='color: #333; margin-bottom: 20px;'>Document Requirement Issue</h2>
            
            <p>Dear <strong>{$studentData['firstname']} {$studentData['lastname']}</strong>,</p>
            
            <p>We have identified an issue with one of your submitted requirements for your document request.</p>
            
            <div style='background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;'>
              <h3 style='color: #dc3545; margin-top: 0;'>Issue Details:</h3>
              <p><strong>Document:</strong> {$studentData['documentName']}</p>
              <p><strong>Purpose:</strong> {$studentData['displayPurpose']}</p>
              <p><strong>Requirement Type:</strong> {$requirementData['requirementType']}</p>
              <p><strong>File:</strong> {$requirementData['filepath']}</p>
              <p><strong>Issue:</strong> {$comment}</p>
            </div>
            
            <div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7;'>
              <h4 style='color: #856404; margin-top: 0;'>Action Required:</h4>
              <p style='color: #856404; margin: 10px 0;'>Please review the issue above and resubmit the corrected requirement file. You can access your request through the student portal.</p>
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
      
      $mail->AltBody = "
        MOGCHS Registrar Office
        
        Document Requirement Issue
        
        Dear {$studentData['firstname']} {$studentData['lastname']},
        
        We have identified an issue with one of your submitted requirements for your document request.
        
        Issue Details:
        - Document: {$studentData['documentName']}
        - Purpose: {$studentData['displayPurpose']}
        - Requirement Type: {$requirementData['requirementType']}
        - File: {$requirementData['filepath']}
        - Issue: {$comment}
        
        Action Required:
        Please review the issue above and resubmit the corrected requirement file. You can access your request through the student portal.
        
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

  function getUserProfile($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];

    try {
      $sql = "SELECT id, firstname, middlename, lastname, email FROM tbluser WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $userId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        return json_encode($profile);
      }
      return json_encode(['error' => 'User profile not found']);
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function updateUserProfile($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];
    $firstname = $json['firstname'];
    $middlename = $json['middlename'];
    $lastname = $json['lastname'];
    $email = $json['email'];

    try {
      $sql = "UPDATE tbluser SET firstname = :firstname, middlename = :middlename, lastname = :lastname, email = :email WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':firstname', $firstname);
      $stmt->bindParam(':middlename', $middlename);
      $stmt->bindParam(':lastname', $lastname);
      $stmt->bindParam(':email', $email);
      $stmt->bindParam(':userId', $userId);

      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Profile updated successfully']);
      }
      return json_encode(['error' => 'Failed to update profile']);
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function verifyCurrentPassword($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];
    $currentPassword = $json['currentPassword'];
    $userType = $json['userType'];

    try {
      $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
      $sql = "SELECT password FROM $table WHERE id = :userId";
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
    $newPassword = $json['newPassword'];
    $userType = $json['userType'];

    try {
      $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
      $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
      $sql = "UPDATE $table SET password = :password WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':password', $hashedPassword);
      $stmt->bindParam(':userId', $userId);
      
      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Password updated successfully.']);
      }
      return json_encode(['success' => false, 'error' => 'Failed to update password.']);
    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function verifyCurrentPin($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];
    $currentPin = $json['currentPin'];
    $userType = $json['userType'];

    try {
      $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
      $sql = "SELECT pinCode FROM $table WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':userId', $userId);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($currentPin, $user['pinCode'])) {
          return json_encode(['success' => true, 'message' => 'Current PIN verified.']);
        }
        return json_encode(['success' => false, 'error' => 'Invalid current PIN.']);
      }
      return json_encode(['success' => false, 'error' => 'User not found.']);
    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function changePin($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];
    $newPin = $json['newPin'];
    $userType = $json['userType'];

    try {
      $hashedPin = password_hash($newPin, PASSWORD_DEFAULT);
      $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
      $sql = "UPDATE $table SET pinCode = :pin WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':pin', $hashedPin);
      $stmt->bindParam(':userId', $userId);
      
      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'PIN updated successfully.']);
      }
      return json_encode(['success' => false, 'error' => 'Failed to update PIN.']);
    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function updateStudent($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $studentId = $json['studentId'];
    $userId = $json['userId'];

    try {
      $sql = "UPDATE tblstudent 
              SET firstname = :firstname, 
                  middlename = :middlename, 
                  lastname = :lastname, 
                  lrn = :lrn,
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
                  strandId = :strandId,
                  sectionId = :sectionId,
                  schoolyearId = :schoolyearId,
                  gradeLevelId = :gradeLevelId,
                  updatedAt = NOW()
              WHERE id = :studentId";

      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':firstname', $json['firstname']);
      $stmt->bindParam(':middlename', $json['middlename']);
      $stmt->bindParam(':lastname', $json['lastname']);
      $stmt->bindParam(':lrn', $json['lrn']);
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
      $stmt->bindParam(':strandId', $json['strandId']);
      $stmt->bindParam(':sectionId', $json['sectionId']);
      $stmt->bindParam(':schoolyearId', $json['schoolyearId']);
      $stmt->bindParam(':gradeLevelId', $json['gradeLevelId']);
      $stmt->bindParam(':studentId', $studentId);

      if ($stmt->execute()) {
        return json_encode(['success' => true, 'message' => 'Student information updated successfully']);
      } else {
        return json_encode(['success' => false, 'error' => 'Failed to update student information']);
      }

    } catch (PDOException $e) {
      return json_encode(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage()]);
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
  case "uploadSingleStudentDocument":
    echo $user->uploadSingleStudentDocument();
    break;
  case "getStrands":
    echo $user->getStrands();
    break;
  case "getGradeLevels":
    echo $user->getGradeLevels();
    break;
  case "getSectionsByGradeLevel":
    echo $user->getSectionsByGradeLevel($json);
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
  case "getAllStudentFiles":
    echo $user->getAllStudentFiles();
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
  case "rejectLrnRequest":
    echo $user->rejectLrnRequest($json);
  break;
  case "addRequirementComment":
    echo $user->addRequirementComment($json);
    break;
  case "getRequirementComments":
    echo $user->getRequirementComments($json);
    break;
  case "updateCommentStatus":
    echo $user->updateCommentStatus($json);
    break;
  case "getExpectedDays":
    echo $user->getExpectedDays();
    break;
  case "markAdditionalRequirementsViewed":
    echo $user->markAdditionalRequirementsViewed($json);
    break;
  case "getRequestOwner":
    echo $user->getRequestOwner($json);
    break;
  case "getProfile": // New case for fetching profile
    echo $user->getUserProfile($json);
    break;
  case "updateProfile": // New case for updating profile
    echo $user->updateUserProfile($json);
    break;
  case "verifyCurrentPassword": // New case for verifying current password
    echo $user->verifyCurrentPassword($json);
    break;
  case "resetPassword": // New case for resetting password
    echo $user->resetPassword($json);
    break;
  case "verifyCurrentPin": // New case for verifying current PIN
    echo $user->verifyCurrentPin($json);
    break;
  case "changePin": // New case for changing PIN
    echo $user->changePin($json);
    break;
  case "updateStudent": // New case for updating student
    echo $user->updateStudent($json);
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>  