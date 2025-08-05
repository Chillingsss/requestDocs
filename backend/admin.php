<?php
include "headers.php";

class User {
  function login($json)
{
    include "connection.php";

    $json = json_decode($json, true);

    // Check in tbluser
    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, a.password, a.pinCode, a.gradeLevelId, a.sectionId, b.name AS userLevel FROM tbluser a
            INNER JOIN tbluserlevel b ON a.userLevel = b.id
            WHERE BINARY a.id = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($json['password'], $user['password'])) {
            return json_encode([
                'id' => $user['id'],
                'userLevel' => $user['userLevel'],
                'firstname' => $user['firstname'],
                'lastname' => $user['lastname'],
                'email' => $user['email'],
                'gradeLevelId' => $user['gradeLevelId'],
                'sectionId' => $user['sectionId']
            ]);
        }
    }


    // Check in tblstudent
    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, a.password, b.name AS userLevel FROM tblstudent a
            INNER JOIN tbluserlevel b ON a.userLevel = b.id
            WHERE BINARY a.id = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($json['password'], $user['password'])) {
            return json_encode([
                'id' => $user['id'],
                'firstname' => $user['firstname'],
                'lastname' => $user['lastname'],
                'email' => $user['email'],
                'userLevel' => $user['userLevel']
            ]);
        }
    }

    return json_encode(null);
}
    
   function addUser($json)
   {
    include "connection.php";

    $json = json_decode($json, true);
    
    // Hash the password before storing
    $hashedPassword = password_hash($json['password'], PASSWORD_DEFAULT);
    
    // Hash the PIN code before storing
    $hashedPinCode = password_hash($json['pinCode'], PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO tbluser (id, firstname, lastname, email, password, pinCode, userLevel, gradeLevelId) VALUES (:id, :firstname, :lastname, :email, :password, :pinCode, :userLevel, :gradeLevelId)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $json['id']);
    $stmt->bindParam(':firstname', $json['firstname']);
    $stmt->bindParam(':lastname', $json['lastname']);
    $stmt->bindParam(':email', $json['email']);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':pinCode', $hashedPinCode);
    $stmt->bindParam(':userLevel', $json['userLevel']);
    $stmt->bindParam(':gradeLevelId', $json['gradeLevelId']);
    $stmt->execute();

    return json_encode(array("status" => "success"));
   }

   function getUserLevel()
   {
    include "connection.php";

    $sql = "SELECT * FROM tbluserlevel";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return json_encode($result);
   }

   function getUsers()
   {
    include "connection.php";

    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, b.name AS userLevel 
            FROM tbluser a
            INNER JOIN tbluserlevel b ON a.userLevel = b.id
            ORDER BY a.firstname, a.lastname";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return json_encode($result);
   }

   function verifyPin($json)
   {
    include "connection.php";

    $json = json_decode($json, true);
    
    $sql = "SELECT pinCode FROM tbluser WHERE BINARY id = :userId";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $json['userId']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($json['pin'], $user['pinCode'])) {
            return json_encode(array("status" => "success", "valid" => true));
        }
    }

    return json_encode(array("status" => "success", "valid" => false));
   }
   
   function getGradelevel(){
    include "connection.php";

    $sql = "SELECT id, name
            FROM tblgradelevel";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return json_encode($result);
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

   function getCompletedRequests()
   {
    include "connection.php";

    try {
      $sql = "SELECT 
                r.id,
                CONCAT(s.firstname, ' ', s.lastname) as student,
                d.name as document,
                r.purpose,
                DATE(r.createdAt) as dateRequested,
                DATE(rs.createdAt) as dateCompleted,
                s.id as studentId
              FROM tblrequest r
              INNER JOIN tbldocument d ON r.documentId = d.id
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstudent s ON r.studentId = s.id
              INNER JOIN tblstatus st ON rs.statusId = st.id
              WHERE st.name = 'Completed'
              AND rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )
              ORDER BY rs.createdAt DESC
              LIMIT 10";

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

   function getRecentActivity()
   {
    include "connection.php";

    try {
      $sql = "SELECT 
                r.id,
                CONCAT(s.firstname, ' ', s.lastname) as student,
                d.name as document,
                st.name as status,
                rs.createdAt as activityDate,
                DATE_FORMAT(rs.createdAt, '%M %d, %Y %h:%i %p') as formattedDate
              FROM tblrequest r
              INNER JOIN tbldocument d ON r.documentId = d.id
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstudent s ON r.studentId = s.id
              INNER JOIN tblstatus st ON rs.statusId = st.id
              WHERE rs.id IN (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )
              ORDER BY rs.createdAt DESC
              LIMIT 5";

      $stmt = $conn->prepare($sql);
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($activities);
      }
      return json_encode([]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function getTotalUsers()
   {
    include "connection.php";

    try {
      // Count total users (both tbluser and tblstudent)
      $sql = "SELECT 
                (SELECT COUNT(*) FROM tbluser) as adminUsers,
                (SELECT COUNT(*) FROM tblstudent) as studentUsers";
      
      $stmt = $conn->prepare($sql);
      $stmt->execute();
      
      $result = $stmt->fetch(PDO::FETCH_ASSOC);
      $totalUsers = $result['adminUsers'] + $result['studentUsers'];
      
      return json_encode([
        'totalUsers' => $totalUsers,
        'adminUsers' => $result['adminUsers'],
        'studentUsers' => $result['studentUsers']
      ]);

    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addStudent($json)
   {
    include "connection.php";
    $json = json_decode($json, true);

    try {
        // Hash the password before storing
        $hashedPassword = password_hash($json['password'], PASSWORD_DEFAULT);
        $defaultUserLevel = 4; // Student user level
        $studentId = $json['id'];
        $sectionId = $json['sectionId'];
        $schoolYearId = $json['schoolYearId'];
        $fileName = 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx';

        // Get the section's grade level ID
        $sectionGradeLevelId = 1;
        $sectionSql = "SELECT gradeLevelId FROM tblsection WHERE id = :sectionId";
        $sectionStmt = $conn->prepare($sectionSql);
        $sectionStmt->bindParam(':sectionId', $sectionId);
        $sectionStmt->execute();
        if ($sectionStmt->rowCount() > 0) {
            $sectionResult = $sectionStmt->fetch(PDO::FETCH_ASSOC);
            $sectionGradeLevelId = $sectionResult['gradeLevelId'] ?? 1;
        }

        // Insert into tblstudent
        $sql = "INSERT INTO tblstudent (
            id, firstname, middlename, lastname, lrn, email, password, userLevel, track, strand, birthDate, age, religion, completeAddress, fatherName, motherName, guardianName, guardianRelationship, sectionId, schoolyearId, createdAt
        ) VALUES (
            :id, :firstname, :middlename, :lastname, :lrn, :email, :password, :userLevel, :track, :strand, :birthDate, :age, :religion, :completeAddress, :fatherName, :motherName, :guardianName, :guardianRelationship, :sectionId, :schoolyearId, NOW()
        )";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $studentId);
        $stmt->bindParam(':firstname', $json['firstname']);
        $stmt->bindParam(':middlename', $json['middlename']);
        $stmt->bindParam(':lastname', $json['lastname']);
        $stmt->bindParam(':lrn', $json['lrn']);
        $stmt->bindParam(':email', $json['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':userLevel', $defaultUserLevel);
        $stmt->bindParam(':track', $json['track']);
        $stmt->bindParam(':strand', $json['strand']);
        $stmt->bindParam(':birthDate', $json['birthDate']);
        $stmt->bindParam(':age', $json['age']);
        $stmt->bindParam(':religion', $json['religion']);
        $stmt->bindParam(':completeAddress', $json['completeAddress']);
        $stmt->bindParam(':fatherName', $json['fatherName']);
        $stmt->bindParam(':motherName', $json['motherName']);
        $stmt->bindParam(':guardianName', $json['guardianName']);
        $stmt->bindParam(':guardianRelationship', $json['guardianRelationship']);
        $stmt->bindParam(':sectionId', $sectionId);
        $stmt->bindParam(':schoolyearId', $schoolYearId);

        if ($stmt->execute()) {
            // Insert into tblsfrecord
            $sfRecordSql = "INSERT INTO tblsfrecord (fileName, studentId, gradeLevelId, userId, createdAt) VALUES (:fileName, :studentId, :gradeLevelId, :userId, NOW())";
            $sfRecordStmt = $conn->prepare($sfRecordSql);
            $sfRecordStmt->bindParam(':fileName', $fileName);
            $sfRecordStmt->bindParam(':studentId', $studentId);
            $sfRecordStmt->bindParam(':gradeLevelId', $sectionGradeLevelId);
            $sfRecordStmt->bindParam(':userId', $json['createdBy']);
            $sfRecordStmt->execute();
            return json_encode(["status" => "success"]);
        } else {
            return json_encode(["status" => "error", "message" => "Failed to insert student"]);
        }
    } catch (Exception $e) {
        return json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
   }

   function getStudentsWithFilters($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $sectionId = isset($json['sectionId']) ? $json['sectionId'] : null;
    $schoolYearId = isset($json['schoolYearId']) ? $json['schoolYearId'] : null;

    try {
      $sql = "SELECT 
                s.id,
                s.firstname,
                s.middlename,
                s.lastname,
                s.lrn,
                s.email,
                s.track,
                s.strand,
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
                sec.name as sectionName,
                sy.year as schoolYear
              FROM tblstudent s
              LEFT JOIN tblsection sec ON s.sectionId = sec.id
              LEFT JOIN tblschoolyear sy ON s.schoolyearId = sy.id
              WHERE 1=1";

      // Add section filter if provided
      if ($sectionId && $sectionId !== '') {
        $sql .= " AND s.sectionId = :sectionId";
      }

      // Add school year filter if provided
      if ($schoolYearId && $schoolYearId !== '') {
        $sql .= " AND s.schoolyearId = :schoolYearId";
      }

      $sql .= " ORDER BY s.lastname, s.firstname";

      $stmt = $conn->prepare($sql);
      
      // Bind parameters if provided
      if ($sectionId && $sectionId !== '') {
        $stmt->bindParam(':sectionId', $sectionId);
      }
      if ($schoolYearId && $schoolYearId !== '') {
        $stmt->bindParam(':schoolYearId', $schoolYearId);
      }

      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($students);
      }
      return json_encode([]);

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
  case "login":
    echo $user->login($json);
    break;
  case "addUser":
    echo $user->addUser($json);
    break;
  case "getUserLevel":
    echo $user->getUserLevel();
    break;
  case "getUsers":
    echo $user->getUsers();
    break;
  case "verifyPin":
    echo $user->verifyPin($json);
    break;
  case "getGradelevel":
    echo $user->getGradelevel();
    break;
  case "getRequestStats":
    echo $user->getRequestStats();
    break;
  case "getCompletedRequests":
    echo $user->getCompletedRequests();
    break;
  case "getRecentActivity":
    echo $user->getRecentActivity();
    break;
  case "getTotalUsers":
    echo $user->getTotalUsers();
    break;
  case "addStudent":
    echo $user->addStudent($json);
    break;
  case "getStudentsWithFilters":
    echo $user->getStudentsWithFilters($json);
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>