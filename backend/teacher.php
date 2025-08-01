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

    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, b.fileName, c.name as gradeLevel, d.name as sectionName
    FROM tblstudent a 
    LEFT JOIN tblsfrecord b ON a.id = b.studentId
    LEFT JOIN tblgradelevel c ON b.gradeLevelId = c.id
    INNER JOIN tblsection d ON a.sectionId = d.id
    ORDER BY a.lastname, a.firstname";
    $stmt = $conn->prepare($sql);
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

    $sql = "SELECT DISTINCT d.name as sectionName, c.name as gradeLevel
    FROM tblstudent a 
    LEFT JOIN tblsfrecord b ON a.id = b.studentId
    LEFT JOIN tblgradelevel c ON b.gradeLevelId = c.id
    INNER JOIN tblsection d ON a.sectionId = d.id
    WHERE c.name IS NOT NULL
    ORDER BY c.name, d.name";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($sections);
    }
    return json_encode([]);
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
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>