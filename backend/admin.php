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
            // Check if password is still the default (lastname)
            $lastnameLower = strtolower($user['lastname']);
            $inputPasswordLower = strtolower($json['password']);
            
            // Debug logging
            error_log("Login attempt - User: " . $user['id'] . ", Lastname: " . $user['lastname'] . ", Input password: " . $json['password']);
            error_log("Password comparison - Lastname lower: " . $lastnameLower . ", Input lower: " . $inputPasswordLower);
            
            // Check if password matches lastname (case-insensitive)
            if ($inputPasswordLower === $lastnameLower) {
                error_log("Password reset required for user: " . $user['id']);
                return json_encode([
                    'id' => $user['id'],
                    'userLevel' => $user['userLevel'],
                    'firstname' => $user['firstname'],
                    'lastname' => $user['lastname'],
                    'email' => $user['email'],
                    'gradeLevelId' => $user['gradeLevelId'],
                    'sectionId' => $user['sectionId'],
                    'needsPasswordReset' => true
                ]);
            }
            error_log("Normal login for user: " . $user['id']);
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
            // Debug logging
            error_log("Student login attempt - User: " . $user['id'] . ", Lastname: " . $user['lastname'] . ", Input password: " . $json['password']);
            error_log("Student email: " . ($user['email'] ? $user['email'] : 'NULL'));
            
            // First check if student has email - if no email, they need to set it up
            if (empty($user['email'])) {
                error_log("Student has no email, needs email setup: " . $user['id']);
                return json_encode([
                    'id' => $user['id'],
                    'firstname' => $user['firstname'],
                    'lastname' => $user['lastname'],
                    'email' => $user['email'],
                    'userLevel' => $user['userLevel'],
                    'needsEmailSetup' => true
                ]);
            }
            
            // Student has email, now check if password is still the default (lastname)
            $lastnameLower = strtolower($user['lastname']);
            $inputPasswordLower = strtolower($json['password']);
            
            error_log("Student password comparison - Lastname lower: " . $lastnameLower . ", Input lower: " . $inputPasswordLower);
            
            // Check if password matches lastname (case-insensitive)
            if ($inputPasswordLower === $lastnameLower) {
                error_log("Password reset required for student: " . $user['id']);
                return json_encode([
                    'id' => $user['id'],
                    'firstname' => $user['firstname'],
                    'lastname' => $user['lastname'],
                    'email' => $user['email'],
                    'userLevel' => $user['userLevel'],
                    'needsPasswordReset' => true
                ]);
            }
            
            error_log("Normal student login for user: " . $user['id']);
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

   function checkEmailExists($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $email = $json['email'];
    
    // Debug logging
    error_log("Checking email existence: $email");
    
    // Check in tbluser
    $sql = "SELECT id, firstname, lastname, email, userLevel FROM tbluser WHERE email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        error_log("Email found in tbluser: " . $user['id']);
        return json_encode([
            'status' => 'success',
            'exists' => true,
            'userType' => 'user',
            'userId' => $user['id'],
            'firstname' => $user['firstname'],
            'lastname' => $user['lastname'],
            'email' => $user['email']
        ]);
    }
    
    // Check in tblstudent
    $sql = "SELECT id, firstname, lastname, email, userLevel FROM tblstudent WHERE email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        error_log("Email found in tblstudent: " . $user['id']);
        return json_encode([
            'status' => 'success',
            'exists' => true,
            'userType' => 'student',
            'userId' => $user['id'],
            'firstname' => $user['firstname'],
            'lastname' => $user['lastname'],
            'email' => $user['email']
        ]);
    }
    
    error_log("Email not found: $email");
    return json_encode([
        'status' => 'success',
        'exists' => false,
        'message' => 'Email not found in our records'
    ]);
   }

   function sendPasswordResetOTP($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $userType = $json['userType']; // 'user' or 'student'
    
    // Debug logging
    error_log("Sending OTP for user: $userId, type: $userType");
    
    // Generate 6-digit OTP
    $otp = sprintf("%06d", mt_rand(0, 999999));
    
    // Get user email
    $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
    $emailSql = "SELECT email, firstname, lastname FROM $table WHERE id = :userId";
    $emailStmt = $conn->prepare($emailSql);
    $emailStmt->bindParam(':userId', $userId);
    $emailStmt->execute();
    
    if ($emailStmt->rowCount() > 0) {
        $user = $emailStmt->fetch(PDO::FETCH_ASSOC);
        $email = $user['email'];
        $fullName = $user['firstname'] . ' ' . $user['lastname'];
        
        error_log("Found user: $fullName, email: $email");
        
        // Send email using PHPMailer
        $emailSent = $this->sendOTPEmail($email, $fullName, $otp);
        
        if ($emailSent) {
            error_log("OTP email sent successfully to: $email");
            return json_encode([
                'status' => 'success', 
                'message' => 'OTP sent successfully',
                'otp' => $otp // Return OTP for frontend storage
            ]);
        } else {
            error_log("Failed to send OTP email to: $email");
            return json_encode(['status' => 'error', 'message' => 'Failed to send OTP email']);
        }
    } else {
        error_log("User not found: $userId in table $table");
        return json_encode(['status' => 'error', 'message' => 'User not found']);
    }
   }
   
   function verifyPasswordResetOTP($json)
   {
    // This function is now simplified since we're doing local verification
    // But we'll keep it for compatibility
    $json = json_decode($json, true);
    
    // For now, just return success - the actual verification is done on frontend
    return json_encode(['status' => 'success', 'valid' => true]);
   }
   
   function checkStudentEmail($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    
    // Check if student has email in database
    $sql = "SELECT email FROM tblstudent WHERE id = :userId";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $hasEmail = !empty($user['email']);
        
        return json_encode([
            'status' => 'success',
            'hasEmail' => $hasEmail,
            'email' => $hasEmail ? $user['email'] : null
        ]);
    }
    
    return json_encode(['status' => 'error', 'message' => 'Student not found']);
   }

   function checkEmailAvailability($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $email = $json['email'];
    $excludeUserId = isset($json['excludeUserId']) ? $json['excludeUserId'] : null;
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return json_encode(['status' => 'error', 'message' => 'Invalid email format']);
    }
    
    // Check in tblstudent
    $studentSql = "SELECT id FROM tblstudent WHERE email = :email";
    if ($excludeUserId) {
        $studentSql .= " AND id != :excludeUserId";
    }
    $studentStmt = $conn->prepare($studentSql);
    $studentStmt->bindParam(':email', $email);
    if ($excludeUserId) {
        $studentStmt->bindParam(':excludeUserId', $excludeUserId);
    }
    $studentStmt->execute();
    
    if ($studentStmt->rowCount() > 0) {
        return json_encode([
            'status' => 'success',
            'available' => false,
            'message' => 'Email is already in use by another student'
        ]);
    }
    
    // Check in tbluser
    $userSql = "SELECT id FROM tbluser WHERE email = :email";
    $userStmt = $conn->prepare($userSql);
    $userStmt->bindParam(':email', $email);
    $userStmt->execute();
    
    if ($userStmt->rowCount() > 0) {
        return json_encode([
            'status' => 'success',
            'available' => false,
            'message' => 'Email is already in use by another user in the system'
        ]);
    }
    
    return json_encode([
        'status' => 'success',
        'available' => true,
        'message' => 'Email is available'
    ]);
   }

   function setupStudentEmail($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $email = $json['email'];
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return json_encode(['status' => 'error', 'message' => 'Invalid email format']);
    }
    
    // Check if email is already used by another student
    $checkSql = "SELECT id FROM tblstudent WHERE email = :email AND id != :userId";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->bindParam(':userId', $userId);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        return json_encode(['status' => 'error', 'message' => 'Email is already in use by another student']);
    }
    
    // Check if email is already used by a user (admin/teacher/registrar)
    $checkUserSql = "SELECT id FROM tbluser WHERE email = :email";
    $checkUserStmt = $conn->prepare($checkUserSql);
    $checkUserStmt->bindParam(':email', $email);
    $checkUserStmt->execute();
    
    if ($checkUserStmt->rowCount() > 0) {
        return json_encode(['status' => 'error', 'message' => 'Email is already in use by another user in the system']);
    }
    
    // Generate 6-digit OTP
    $otp = sprintf("%06d", mt_rand(0, 999999));
    
    // Get student info for email
    $sql = "SELECT firstname, lastname FROM tblstudent WHERE id = :userId";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        $fullName = $user['firstname'] . ' ' . $user['lastname'];
        
        // Send OTP email for email setup
        $emailSent = $this->sendEmailSetupOTP($email, $fullName, $otp);
        
        if ($emailSent) {
            return json_encode([
                'status' => 'success',
                'message' => 'OTP sent to your email for verification',
                'otp' => $otp // Return OTP for frontend verification
            ]);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to send OTP email']);
        }
    }
    
    return json_encode(['status' => 'error', 'message' => 'Student not found']);
   }

   function verifyEmailSetupOTP($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $email = $json['email'];
    $otp = $json['otp'];
    $inputOtp = $json['inputOtp'];
    
    // Verify OTP
    if ($otp === $inputOtp) {
        // Update student email
        $sql = "UPDATE tblstudent SET email = :email WHERE id = :userId";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode([
                'status' => 'success',
                'message' => 'Email verified and saved successfully'
            ]);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to save email']);
        }
    } else {
        return json_encode(['status' => 'error', 'message' => 'Invalid OTP']);
    }
   }

   function resetPassword($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $userType = $json['userType'];
    $newPassword = $json['newPassword'];
    
    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password in appropriate table
    $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
    $sql = "UPDATE $table SET password = :password WHERE id = :userId";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':userId', $userId);
    
    if ($stmt->execute()) {
        // Clean up OTP after successful password reset
        // global $otpStorage; // Removed global otpStorage
        // $otpKey = $userId . '_' . $userType;
        // if (isset($otpStorage[$otpKey])) {
        //     unset($otpStorage[$otpKey]);
        // }
        
        return json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
    }
    
    return json_encode(['status' => 'error', 'message' => 'Failed to reset password']);
   }
   
   // Removed private function cleanupExpiredOTPs()
   
   private function sendEmailSetupOTP($email, $fullName, $otp)
   {
    try {
        require 'vendor/autoload.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'ralp.pelino11@gmail.com';
        $mail->Password = 'esip bjyt ymrh yhoq';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        
        // Enable debug output
        $mail->SMTPDebug = 0; // Set to 2 for debugging
        
        // Recipients
        $mail->setFrom('noreply@mogchs.com', 'MOGCHS System');
        $mail->addAddress($email, $fullName);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Email Verification OTP - MOGCHS';
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background-color: #f8f9fa; padding: 20px; text-align: center;'>
                    <h2 style='color: #333;'>MOGCHS Email Verification</h2>
                </div>
                <div style='padding: 20px; background-color: #ffffff;'>
                    <p>Dear <strong>$fullName</strong>,</p>
                    <p>You are setting up your email address for the first time. Please use the following OTP to verify your email:</p>
                    <div style='background-color: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;'>$otp</h1>
                    </div>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This OTP is valid for 10 minutes only</li>
                        <li>Do not share this OTP with anyone</li>
                        <li>After verification, you can proceed to reset your password</li>
                    </ul>
                    <p>Best regards,<br>MOGCHS System Administrator</p>
                </div>
                <div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;'>
                    This is an automated message. Please do not reply to this email.
                </div>
            </div>
        ";
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Failed to send email setup OTP: " . $mail->ErrorInfo);
        return false;
    }
   }

   private function sendOTPEmail($email, $fullName, $otp)
   {
    try {
        require 'vendor/autoload.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'ralp.pelino11@gmail.com';
        $mail->Password = 'esip bjyt ymrh yhoq';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        
        // Enable debug output
        $mail->SMTPDebug = 0; // Set to 2 for debugging
        
        // Recipients
        $mail->setFrom('noreply@mogchs.com', 'MOGCHS System');
        $mail->addAddress($email, $fullName);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset OTP - MOGCHS';
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background-color: #f8f9fa; padding: 20px; text-align: center;'>
                    <h2 style='color: #333;'>MOGCHS Password Reset</h2>
                </div>
                <div style='padding: 20px; background-color: #ffffff;'>
                    <p>Dear <strong>$fullName</strong>,</p>
                    <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
                    <div style='background-color: #f8f9fa; padding: 15px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;'>$otp</h1>
                    </div>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This OTP is valid for 10 minutes only</li>
                        <li>Do not share this OTP with anyone</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                    </ul>
                    <p>Best regards,<br>MOGCHS System Administrator</p>
                </div>
                <div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        ";
        
        $mail->send();
        error_log("Email sent successfully to: $email");
        return true;
    } catch (Exception $e) {
        error_log("Email sending failed: " . $e->getMessage());
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
   }
    
   function addUser($json)
   {
    include "connection.php";

    $json = json_decode($json, true);
    
    // Hash the password before storing
    $hashedPassword = password_hash($json['password'], PASSWORD_DEFAULT);
    
    // Hash the PIN code before storing
    $hashedPinCode = password_hash($json['pinCode'], PASSWORD_DEFAULT);
    
    // Check if sectionId is provided (for teachers)
    $sectionId = isset($json['sectionId']) ? $json['sectionId'] : null;
    
    try {
        $sql = "INSERT INTO tbluser (id, firstname, lastname, email, password, pinCode, userLevel, gradeLevelId, sectionId) VALUES (:id, :firstname, :lastname, :email, :password, :pinCode, :userLevel, :gradeLevelId, :sectionId)";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        $stmt->bindParam(':firstname', $json['firstname']);
        $stmt->bindParam(':lastname', $json['lastname']);
        $stmt->bindParam(':email', $json['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':pinCode', $hashedPinCode);
        $stmt->bindParam(':userLevel', $json['userLevel']);
        $stmt->bindParam(':gradeLevelId', $json['gradeLevelId']);
        $stmt->bindParam(':sectionId', $sectionId);
        $stmt->execute();

        return json_encode(array("status" => "success", "message" => "User added successfully"));
    } catch (PDOException $e) {
        // Check for duplicate entry error
        if ($e->getCode() == 23000) {
            if (strpos($e->getMessage(), 'PRIMARY') !== false) {
                return json_encode(array("status" => "error", "message" => "User ID already exists. Please use a different User ID."));
            } else if (strpos($e->getMessage(), 'email') !== false) {
                return json_encode(array("status" => "error", "message" => "Email address already exists. Please use a different email."));
            } else {
                return json_encode(array("status" => "error", "message" => "Duplicate entry found. Please check your input and try again."));
            }
        }
        
        // Log the error for debugging
        error_log("Database error in addUser: " . $e->getMessage());
        return json_encode(array("status" => "error", "message" => "Failed to add user. Please try again."));
    }
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
            id, firstname, middlename, lastname, lrn, email, password, userLevel, birthDate, age, religion, completeAddress, fatherName, motherName, guardianName, guardianRelationship, sectionId, schoolyearId, strandId, createdAt
        ) VALUES (
            :id, :firstname, :middlename, :lastname, :lrn, :email, :password, :userLevel, :birthDate, :age, :religion, :completeAddress, :fatherName, :motherName, :guardianName, :guardianRelationship, :sectionId, :schoolyearId, :strandId, NOW()
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
        $stmt->bindParam(':strandId', $json['strandId']);

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

   function getSection()
   {
    include "connection.php";

    $gradeLevelId = isset($_POST["gradeLevelId"]) ? $_POST["gradeLevelId"] : null;

    if ($gradeLevelId) {
        // Filter sections by grade level and exclude sections that already have a teacher
        $sql = "SELECT s.* FROM tblsection s 
                LEFT JOIN tbluser u ON s.id = u.sectionId 
                WHERE s.gradeLevelId = :gradeLevelId 
                AND (u.sectionId IS NULL OR u.sectionId = '')
                GROUP BY s.id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':gradeLevelId', $gradeLevelId);
    } else {
        // Get all sections that don't have a teacher assigned
        $sql = "SELECT s.* FROM tblsection s 
                LEFT JOIN tbluser u ON s.id = u.sectionId 
                WHERE (u.sectionId IS NULL OR u.sectionId = '')
                GROUP BY s.id";
        $stmt = $conn->prepare($sql);
    }

    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($sections);
    }
    return json_encode([]);
   }

   function getAllSections()
   {
    include "connection.php";

    $gradeLevelId = isset($_POST["gradeLevelId"]) ? $_POST["gradeLevelId"] : null;

    if ($gradeLevelId) {
        // Filter sections by grade level only (no teacher assignment filter)
        $sql = "SELECT s.* FROM tblsection s 
                WHERE s.gradeLevelId = :gradeLevelId 
                ORDER BY s.name";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':gradeLevelId', $gradeLevelId);
    } else {
        // Get all sections (no teacher assignment filter)
        $sql = "SELECT s.* FROM tblsection s 
                ORDER BY s.name";
        $stmt = $conn->prepare($sql);
    }

    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($sections);
    }
    return json_encode([]);
   }

   function checkUserExists($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    
    // Check in tbluser
    $sql = "SELECT id FROM tbluser WHERE id = :userId";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        return json_encode([
            'status' => 'success',
            'exists' => true,
            'message' => 'User ID already exists'
        ]);
    }
    
    // Check in tblstudent
    $sql = "SELECT id FROM tblstudent WHERE id = :userId";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        return json_encode([
            'status' => 'success',
            'exists' => true,
            'message' => 'User ID already exists'
        ]);
    }
    
    return json_encode([
        'status' => 'success',
        'exists' => false,
        'message' => 'User ID is available'
    ]);
   }

   function getUserProfile($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    $userId = $json['userId'];
    $userType = $json['userType']; // 'user' or 'student'
    
    try {
        if ($userType === 'student') {
            // Get student profile
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
                      st.name as strand,
                      ul.name as userLevel
                    FROM tblstudent s
                    LEFT JOIN tblsection sec ON s.sectionId = sec.id
                    LEFT JOIN tblschoolyear sy ON s.schoolyearId = sy.id
                    LEFT JOIN tblstrand st ON s.strandId = st.id
                    LEFT JOIN tbltrack t ON st.trackId = t.id
                    LEFT JOIN tbluserlevel ul ON s.userLevel = ul.id
                    WHERE s.id = :userId";
        } else {
            // Get admin/teacher profile
            $sql = "SELECT 
                      u.id,
                      u.firstname,
                      u.lastname,
                      u.email,
                      u.gradeLevelId,
                      u.sectionId,
                      gl.name as gradeLevel,
                      sec.name as sectionName,
                      ul.name as userLevel
                    FROM tbluser u
                    LEFT JOIN tblgradelevel gl ON u.gradeLevelId = gl.id
                    LEFT JOIN tblsection sec ON u.sectionId = sec.id
                    LEFT JOIN tbluserlevel ul ON u.userLevel = ul.id
                    WHERE u.id = :userId";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':userId', $userId);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
            $profile['userType'] = $userType; // Add user type to profile data
            return json_encode($profile);
        }
        return json_encode(['error' => 'User profile not found']);

    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function updateUserProfile($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    $userId = $json['userId'];
    $userType = $json['userType'];
    
    try {
        if ($userType === 'student') {
            // Update student profile
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
                        guardianRelationship = :guardianRelationship
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
        } else {
            // Update admin/teacher profile
            $sql = "UPDATE tbluser 
                    SET firstname = :firstname, 
                        lastname = :lastname, 
                        email = :email,
                        gradeLevelId = :gradeLevelId,
                        sectionId = :sectionId
                    WHERE id = :userId";
            
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':firstname', $json['firstname']);
            $stmt->bindParam(':lastname', $json['lastname']);
            $stmt->bindParam(':email', $json['email']);
            $stmt->bindParam(':gradeLevelId', $json['gradeLevelId']);
            $stmt->bindParam(':sectionId', $json['sectionId']);
            $stmt->bindParam(':userId', $userId);
        }

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
  case "login":
    echo $user->login($json);
    break;
  case "checkEmailExists":
    echo $user->checkEmailExists($json);
    break;
  case "sendPasswordResetOTP":
    echo $user->sendPasswordResetOTP($json);
    break;
  case "verifyPasswordResetOTP":
    echo $user->verifyPasswordResetOTP($json);
    break;
  case "resetPassword":
    echo $user->resetPassword($json);
    break;
  case "checkStudentEmail":
    echo $user->checkStudentEmail($json);
    break;
  case "checkEmailAvailability":
    echo $user->checkEmailAvailability($json);
    break;
  case "setupStudentEmail":
    echo $user->setupStudentEmail($json);
    break;
  case "verifyEmailSetupOTP":
    echo $user->verifyEmailSetupOTP($json);
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
  case "getSection":
    echo $user->getSection();
    break;
  case "getAllSections":
    echo $user->getAllSections();
    break;
  case "checkUserExists":
    echo $user->checkUserExists($json);
    break;
  case "getUserProfile":
    echo $user->getUserProfile($json);
    break;
  case "updateUserProfile":
    echo $user->updateUserProfile($json);
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>