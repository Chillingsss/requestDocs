<?php
include "headers.php";

class User {
  function login($json) {
    include "connection.php";

    $json = json_decode($json, true);

    // Check in tbluser
    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, a.password, a.pinCode, a.gradeLevelId, a.sectionId, a.isActive, b.name AS userLevel, d.id AS academicTypeId FROM tbluser a
            INNER JOIN tbluserlevel b ON a.userLevel = b.id
            LEFT JOIN tblgradelevel c ON a.gradeLevelId = c.id
            LEFT JOIN tblacademictype d ON c.academicTId = d.id
            WHERE BINARY a.id = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if account is active
        if (!$user['isActive']) {
            return json_encode(['error' => 'Account has been deactivated. Please contact administrator.']);
        }
        
        if (password_verify($json['password'], $user['password'])) {
            // Check if password is still the default (lastname)
            $lastnameLower = strtolower($user['lastname']);
            $inputPasswordLower = strtolower($json['password']);
            
            // Debug logging
            error_log("Login attempt - User: " . $user['id'] . ", Lastname: " . $user['lastname'] . ", Input password: " . $json['password']);
            error_log("Password comparison - Lastname lower: " . $lastnameLower . ", Input lower: " . $inputPasswordLower);
            
            // Check if password matches lastname (case-insensitive) and if PIN matches last 4 digits of ID
            $lastFourDigits = substr($user['id'], -4);
            $needsPasswordReset = $inputPasswordLower === $lastnameLower;
            
            // Check if PIN matches last 4 digits of ID using password_verify
            $needsPinReset = password_verify($lastFourDigits, $user['pinCode']);
            error_log("PIN verification - Last 4 digits: " . $lastFourDigits . ", Needs Reset: " . ($needsPinReset ? "Yes" : "No"));
            
            if ($needsPasswordReset || $needsPinReset) {
                error_log("Password/PIN reset required for user: " . $user['id'] . ", Password Reset: " . ($needsPasswordReset ? "Yes" : "No") . ", PIN Reset: " . ($needsPinReset ? "Yes" : "No"));
                return json_encode([
                    'id' => $user['id'],
                    'userLevel' => $user['userLevel'],
                    'firstname' => $user['firstname'],
                    'lastname' => $user['lastname'],
                    'email' => $user['email'],
                    'gradeLevelId' => $user['gradeLevelId'],
                    'sectionId' => $user['sectionId'],
                    'needsPasswordReset' => $needsPasswordReset,
                    'needsPinReset' => $needsPinReset,
                    'academicTypeId' => $user['academicTypeId'],
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
                'sectionId' => $user['sectionId'],
                'academicTypeId' => $user['academicTypeId'],
            ]);
        }
    }


    // Check in tblstudent
    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, a.password, a.isActive, b.name AS userLevel FROM tblstudent a
            INNER JOIN tbluserlevel b ON a.userLevel = b.id
            WHERE BINARY a.id = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $json['username']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if account is active
        if (!$user['isActive']) {
            return json_encode(['error' => 'Account has been deactivated. Please contact administrator.']);
        }
        
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

    return json_encode(['error' => 'Invalid credentials']);
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
    $newPassword = isset($json['newPassword']) ? $json['newPassword'] : null;
    $newPinCode = isset($json['newPinCode']) ? $json['newPinCode'] : null;
    
    try {
        $conn->beginTransaction();
        
        // Determine what needs to be updated
        $updatePassword = !empty($newPassword);
        $updatePinCode = !empty($newPinCode) && $userType !== 'student';
        
        if (!$updatePassword && !$updatePinCode) {
            return json_encode(['status' => 'error', 'message' => 'No credentials provided for update']);
        }
        
        $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
        $updates = [];
        $params = [':userId' => $userId];
        
        // Build dynamic SQL update statement
        if ($updatePassword) {
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $updates[] = "password = :password";
            $params[':password'] = $hashedPassword;
        }
        
        if ($updatePinCode) {
            $hashedPinCode = password_hash($newPinCode, PASSWORD_DEFAULT);
            $updates[] = "pinCode = :pinCode";
            $params[':pinCode'] = $hashedPinCode;
        }
        
        $sql = "UPDATE $table SET " . implode(", ", $updates) . " WHERE id = :userId";
        $stmt = $conn->prepare($sql);
        
        foreach ($params as $key => &$value) {
            $stmt->bindParam($key, $value);
        }
        
        if ($stmt->execute()) {
            $conn->commit();
            $message = [];
            if ($updatePassword) $message[] = "password";
            if ($updatePinCode) $message[] = "PIN code";
            return json_encode([
                'status' => 'success', 
                'message' => ucfirst(implode(" and ", $message)) . " reset successfully"
            ]);
        } else {
            $conn->rollBack();
            return json_encode(['status' => 'error', 'message' => 'Failed to reset credentials']);
        }
    } catch (Exception $e) {
        $conn->rollBack();
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
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

    $sql = "SELECT a.id, a.firstname, a.lastname, a.email, a.isActive, b.name AS userLevel 
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
                r.purpose as freeTextPurpose,
                GROUP_CONCAT(DISTINCT p.name) as predefinedPurposes,
                DATE(r.createdAt) as dateRequested,
                DATE(rs.createdAt) as dateCompleted,
                st.name as status
              FROM tblrequest r
              INNER JOIN tbldocument d ON r.documentId = d.id
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus st ON rs.statusId = st.id
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblrequestpurpose rp ON r.id = rp.requestId
              LEFT JOIN tblpurpose p ON rp.purposeId = p.id
              WHERE rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )
              AND st.name = 'Completed'
              GROUP BY r.id, s.firstname, s.lastname, d.name, r.purpose, r.createdAt, rs.createdAt, st.name
              ORDER BY rs.createdAt DESC
              LIMIT 50";

      $stmt = $conn->prepare($sql);
      $stmt->execute();
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

      return json_encode($rows);
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

  function getRequestAnalytics($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    $dateFrom = isset($json['dateFrom']) && !empty($json['dateFrom']) ? $json['dateFrom'] : null;
    $dateTo = isset($json['dateTo']) && !empty($json['dateTo']) ? $json['dateTo'] : null;
    $granularity = isset($json['granularity']) && !empty($json['granularity']) ? strtolower($json['granularity']) : 'day';

    try {
      // Status distribution within optional date range (based on latest status timestamp per request)
      $statusSql = "SELECT 
                s.name as status,
                COUNT(DISTINCT r.id) as count
              FROM tblrequest r
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              WHERE rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )";
      if ($dateFrom) {
        $statusSql .= " AND DATE(rs.createdAt) >= :dateFrom";
      }
      if ($dateTo) {
        $statusSql .= " AND DATE(rs.createdAt) <= :dateTo";
      }
      $statusSql .= " GROUP BY s.id, s.name";
      $statusStmt = $conn->prepare($statusSql);
      if ($dateFrom) {
        $statusStmt->bindParam(':dateFrom', $dateFrom);
      }
      if ($dateTo) {
        $statusStmt->bindParam(':dateTo', $dateTo);
      }
      $statusStmt->execute();
      $statusRows = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

      // Completed counts in range (based on completed status timestamp)
      $completedSql = "SELECT COUNT(*) as completedCount
              FROM tblrequest r
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus st ON rs.statusId = st.id
              WHERE st.name = 'Completed'";
      if ($dateFrom) {
        $completedSql .= " AND DATE(rs.createdAt) >= :cDateFrom";
      }
      if ($dateTo) {
        $completedSql .= " AND DATE(rs.createdAt) <= :cDateTo";
      }
      $completedStmt = $conn->prepare($completedSql);
      if ($dateFrom) {
        $completedStmt->bindParam(':cDateFrom', $dateFrom);
      }
      if ($dateTo) {
        $completedStmt->bindParam(':cDateTo', $dateTo);
      }
      $completedStmt->execute();
      $completedRow = $completedStmt->fetch(PDO::FETCH_ASSOC);
      $completedInRange = $completedRow ? intval($completedRow['completedCount']) : 0;

      // Today vs Yesterday completed
      $todayStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM tblrequeststatus rs INNER JOIN tblstatus st ON rs.statusId = st.id WHERE st.name='Completed' AND DATE(rs.createdAt) = CURDATE()");
      $todayStmt->execute();
      $todayCount = intval(($todayStmt->fetch(PDO::FETCH_ASSOC))['cnt'] ?? 0);

      $yesterdayStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM tblrequeststatus rs INNER JOIN tblstatus st ON rs.statusId = st.id WHERE st.name='Completed' AND DATE(rs.createdAt) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");
      $yesterdayStmt->execute();
      $yesterdayCount = intval(($yesterdayStmt->fetch(PDO::FETCH_ASSOC))['cnt'] ?? 0);

      $percentChange = $yesterdayCount > 0 ? (($todayCount - $yesterdayCount) / $yesterdayCount) * 100 : ($todayCount > 0 ? 100 : 0);

      // Time series completed counts by granularity
      $timeSql = '';
      switch ($granularity) {
        case 'year':
          $timeSql = "SELECT DATE_FORMAT(rs.createdAt, '%Y') as label, COUNT(*) as cnt
                      FROM tblrequeststatus rs
                      INNER JOIN tblstatus st ON rs.statusId = st.id
                      WHERE st.name = 'Completed'";
          if ($dateFrom) { $timeSql .= " AND DATE(rs.createdAt) >= :tFrom"; }
          if ($dateTo) { $timeSql .= " AND DATE(rs.createdAt) <= :tTo"; }
          $timeSql .= " GROUP BY DATE_FORMAT(rs.createdAt, '%Y') ORDER BY DATE_FORMAT(rs.createdAt, '%Y')";
          break;
        case 'month':
          $timeSql = "SELECT DATE_FORMAT(rs.createdAt, '%Y-%m') as label, COUNT(*) as cnt
                      FROM tblrequeststatus rs
                      INNER JOIN tblstatus st ON rs.statusId = st.id
                      WHERE st.name = 'Completed'";
          if ($dateFrom) { $timeSql .= " AND DATE(rs.createdAt) >= :tFrom"; }
          if ($dateTo) { $timeSql .= " AND DATE(rs.createdAt) <= :tTo"; }
          $timeSql .= " GROUP BY DATE_FORMAT(rs.createdAt, '%Y-%m') ORDER BY DATE_FORMAT(rs.createdAt, '%Y-%m')";
          break;
        case 'week':
          $timeSql = "SELECT DATE_FORMAT(rs.createdAt, '%x-W%v') as label, COUNT(*) as cnt
                      FROM tblrequeststatus rs
                      INNER JOIN tblstatus st ON rs.statusId = st.id
                      WHERE st.name = 'Completed'";
          if ($dateFrom) { $timeSql .= " AND DATE(rs.createdAt) >= :tFrom"; }
          if ($dateTo) { $timeSql .= " AND DATE(rs.createdAt) <= :tTo"; }
          $timeSql .= " GROUP BY DATE_FORMAT(rs.createdAt, '%x-W%v') ORDER BY MIN(DATE(rs.createdAt))";
          break;
        case 'day':
        default:
          $timeSql = "SELECT DATE(rs.createdAt) as label, COUNT(*) as cnt
                      FROM tblrequeststatus rs
                      INNER JOIN tblstatus st ON rs.statusId = st.id
                      WHERE st.name = 'Completed'";
          if ($dateFrom) { $timeSql .= " AND DATE(rs.createdAt) >= :tFrom"; }
          if ($dateTo) { $timeSql .= " AND DATE(rs.createdAt) <= :tTo"; }
          if (!$dateFrom && !$dateTo) { $timeSql .= " AND rs.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)"; }
          $timeSql .= " GROUP BY DATE(rs.createdAt) ORDER BY DATE(rs.createdAt)";
          break;
      }

      $timeStmt = $conn->prepare($timeSql);
      if ($dateFrom) { $timeStmt->bindParam(':tFrom', $dateFrom); }
      if ($dateTo) { $timeStmt->bindParam(':tTo', $dateTo); }
      $timeStmt->execute();
      $timeRows = $timeStmt->fetchAll(PDO::FETCH_ASSOC);

      return json_encode([
        'statusCounts' => $statusRows,
        'completedInRange' => $completedInRange,
        'todayCompleted' => $todayCount,
        'yesterdayCompleted' => $yesterdayCount,
        'percentChange' => $percentChange,
        'timeSeries' => $timeRows,
        'granularity' => $granularity
      ]);
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

        // Insert into tblstudent (with gradeLevelId)
        $sql = "INSERT INTO tblstudent (
            id, firstname, middlename, lastname, lrn, email, password, userLevel, birthDate, age, religion, completeAddress, fatherName, motherName, guardianName, guardianRelationship, sectionId, schoolyearId, strandId, gradeLevelId, createdAt
        ) VALUES (
            :id, :firstname, :middlename, :lastname, :lrn, :email, :password, :userLevel, :birthDate, :age, :religion, :completeAddress, :fatherName, :motherName, :guardianName, :guardianRelationship, :sectionId, :schoolyearId, :strandId, :gradeLevelId, NOW()
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
        $stmt->bindParam(':gradeLevelId', $json['gradeLevelId']);

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
                s.isActive,
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

    try {
      $sql = "SELECT a.id, a.firstname, a.middlename, a.lastname, a.email, b.name AS userLevel 
              FROM tbluser a
              INNER JOIN tbluserlevel b ON a.userLevel = b.id
              WHERE a.id = :userId";
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

   function activateUser($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $userType = $json['userType']; // 'user' or 'student'
    
    try {
        $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
        $sql = "UPDATE $table SET isActive = 1 WHERE id = :userId";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'User activated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to activate user']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deactivateUser($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    $userId = $json['userId'];
    $userType = $json['userType']; // 'user' or 'student'
    
    try {
        $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
        $sql = "UPDATE $table SET isActive = 0 WHERE id = :userId";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'User deactivated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to deactivate user']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Resources management functions
   function getDocuments()
   {
    include "connection.php";

    try {
        $sql = "SELECT * FROM tbldocument ORDER BY name";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($documents);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function getRequirementTypes()
   {
    include "connection.php";

    try {
        $sql = "SELECT * FROM tblrequirementstype ORDER BY nameType";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $requirementTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($requirementTypes);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addDocument($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tbldocument (name, userId, createdAt) VALUES (:name, :userId, NOW())";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $userId = $json['userId'] ?? null;
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Document added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add document']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function addRequirementType($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tblrequirementstype (nameType, userId, createdAt) VALUES (:nameType, :userId, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':nameType', $json['name']);
        $userId = $json['userId'] ?? null;
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Requirement type added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add requirement type']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateDocument($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tbldocument SET name = :name, userId = :userId WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $userId = $json['userId'] ?? null;
        $id = $json['id'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Document updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update document']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateRequirementType($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tblrequirementstype SET nameType = :nameType, userId = :userId WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $nameType = $json['name'];
        $userId = $json['userId'] ?? null;
        $id = $json['id'];
        
        $stmt->bindParam(':nameType', $nameType);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Requirement type updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update requirement type']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteDocument($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if document is being used in requests
        $checkSql = "SELECT COUNT(*) as count FROM tblrequest WHERE documentId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete document. It is being used in requests.']);
        }
        
        $sql = "DELETE FROM tbldocument WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Document deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete document']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteRequirementType($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if requirement type is being used in requirements
        $checkSql = "SELECT COUNT(*) as count FROM tblrequirements WHERE typeId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete requirement type. It is being used in requirements.']);
        }
        
        $sql = "DELETE FROM tblrequirementstype WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Requirement type deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete requirement type']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Document Requirements management functions
   function getDocumentRequirements()
   {
    include "connection.php";

    try {
        $sql = "SELECT 
                    dr.id,
                    dr.documentId,
                    dr.requirementTId,
                    d.name as documentName,
                    rt.nameType as requirementTypeName,
                    dr.userId,
                    dr.createdAt
                FROM tbldocumentrequirement dr
                INNER JOIN tbldocument d ON dr.documentId = d.id
                INNER JOIN tblrequirementstype rt ON dr.requirementTId = rt.id
                ORDER BY d.name, rt.nameType";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $documentRequirements = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($documentRequirements);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addDocumentRequirement($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if the document-requirement combination already exists
        $checkSql = "SELECT COUNT(*) as count FROM tbldocumentrequirement WHERE documentId = :documentId AND requirementTId = :requirementTId";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':documentId', $json['documentId']);
        $checkStmt->bindParam(':requirementTId', $json['requirementTId']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'This requirement is already assigned to this document.']);
        }
        
        $sql = "INSERT INTO tbldocumentrequirement (documentId, requirementTId, userId, createdAt) VALUES (:documentId, :requirementTId, :userId, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':documentId', $json['documentId']);
        $stmt->bindParam(':requirementTId', $json['requirementTId']);
        $stmt->bindParam(':userId', $json['userId'] ?? null);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Document requirement added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add document requirement']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteDocumentRequirement($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "DELETE FROM tbldocumentrequirement WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Document requirement removed successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to remove document requirement']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateDocumentRequirements($json)
   {
    include "connection.php";
    $json = json_decode($json, true);

    try {
        $conn->beginTransaction();

        $documentId = $json['documentId'];
        $newRequirementTypeIds = $json['requirementTypeIds'];
        $userId = $json['userId'] ?? null;

        // Get current requirements for this document
        $currentSql = "SELECT requirementTId FROM tbldocumentrequirement WHERE documentId = :documentId";
        $currentStmt = $conn->prepare($currentSql);
        $currentStmt->bindParam(':documentId', $documentId);
        $currentStmt->execute();
        $currentRequirements = $currentStmt->fetchAll(PDO::FETCH_COLUMN);

        // Remove requirements that are no longer selected
        $toRemove = array_diff($currentRequirements, $newRequirementTypeIds);
        if (!empty($toRemove)) {
            $removeSql = "DELETE FROM tbldocumentrequirement WHERE documentId = :documentId AND requirementTId = :requirementTId";
            $removeStmt = $conn->prepare($removeSql);

            foreach ($toRemove as $reqId) {
                $removeStmt->bindParam(':documentId', $documentId);
                $removeStmt->bindParam(':requirementTId', $reqId);
                $removeStmt->execute();
            }
        }

        // Add new requirements that weren't there before
        $toAdd = array_diff($newRequirementTypeIds, $currentRequirements);
        if (!empty($toAdd)) {
            $addSql = "INSERT INTO tbldocumentrequirement (documentId, requirementTId, userId, createdAt) VALUES (:documentId, :requirementTId, :userId, NOW())";
            $addStmt = $conn->prepare($addSql);

            foreach ($toAdd as $reqTypeId) {
                $addStmt->bindParam(':documentId', $documentId);
                $addStmt->bindParam(':requirementTId', $reqTypeId);
                $addStmt->bindParam(':userId', $userId);
                $addStmt->execute();
            }
        }

        $conn->commit();
        return json_encode(['status' => 'success', 'message' => 'Document requirements updated successfully']);

    } catch (PDOException $e) {
        $conn->rollBack();
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Purpose management functions
   function getPurposes()
   {
    include "connection.php";

    try {
        $sql = "SELECT
                    p.id,
                    p.name,
                    p.documentId,
                    p.userId,
                    p.createdAt,
                    d.name as documentName
                FROM tblpurpose p
                INNER JOIN tbldocument d ON p.documentId = d.id
                ORDER BY d.name, p.name";
        $stmt = $conn->prepare($sql);
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

   function addPurpose($json)
   {
    include "connection.php";
    $json = json_decode($json, true);

    try {
        $sql = "INSERT INTO tblpurpose (name, documentId, userId, createdAt) VALUES (:name, :documentId, :userId, NOW())";
        $stmt = $conn->prepare($sql);

        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $documentId = $json['documentId'];
        $userId = $json['userId'] ?? null;

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':documentId', $documentId);
        $stmt->bindParam(':userId', $userId);

        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Purpose added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add purpose']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updatePurpose($json)
   {
    include "connection.php";
    $json = json_decode($json, true);

    try {
        $sql = "UPDATE tblpurpose SET name = :name, documentId = :documentId, userId = :userId WHERE id = :id";
        $stmt = $conn->prepare($sql);

        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $documentId = $json['documentId'];
        $userId = $json['userId'] ?? null;
        $id = $json['id'];

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':documentId', $documentId);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Purpose updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update purpose']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deletePurpose($json)
   {
    include "connection.php";
    $json = json_decode($json, true);

    try {
        // Check if purpose is being used in requests
        $checkSql = "SELECT COUNT(*) as count FROM tblrequestpurpose WHERE purposeId = :id";
        $checkStmt = $conn->prepare($checkSql);

        // Store value in variable to avoid bindParam reference issues
        $id = $json['id'];
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete purpose. It is being used in requests.']);
        }

        $sql = "DELETE FROM tblpurpose WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Purpose deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete purpose']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Grade Level management functions
   function getGradeLevels()
   {
    include "connection.php";

    try {
        $sql = "SELECT 
                    gl.id,
                    gl.name,
                    gl.academicTId,
                    gl.userId,
                    gl.createdAt,
                    at.name as academicTypeName
                FROM tblgradelevel gl
                LEFT JOIN tblacademictype at ON gl.academicTId = at.id
                ORDER BY gl.name";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $gradeLevels = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Format the response to include academicType as an object
            $formattedGradeLevels = array_map(function($gl) {
                return [
                    'id' => $gl['id'],
                    'name' => $gl['name'],
                    'academicTId' => $gl['academicTId'],
                    'userId' => $gl['userId'],
                    'createdAt' => $gl['createdAt'],
                    'academicType' => $gl['academicTId'] ? [
                        'id' => $gl['academicTId'],
                        'name' => $gl['academicTypeName'],
                    ] : null
                ];
            }, $gradeLevels);
            return json_encode($formattedGradeLevels);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addGradeLevel($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tblgradelevel (name, academicTId, userId, createdAt) VALUES (:name, :academicTId, :userId, NOW())";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $academicTId = $json['academicTId'] ?? null;
        $userId = $json['userId'] ?? null;
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':academicTId', $academicTId);
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Grade level added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add grade level']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateGradeLevel($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tblgradelevel SET name = :name, academicTId = :academicTId, userId = :userId WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $academicTId = $json['academicTId'] ?? null;
        $userId = $json['userId'] ?? null;
        $id = $json['id'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':academicTId', $academicTId);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Grade level updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update grade level']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteGradeLevel($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if grade level is being used in sections
        $checkSql = "SELECT COUNT(*) as count FROM tblsection WHERE gradeLevelId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete grade level. It is being used in sections.']);
        }
        
        $sql = "DELETE FROM tblgradelevel WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Grade level deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete grade level']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Academic Type management functions
   function getAcademicTypes()
   {
    include "connection.php";

    try {
        $sql = "SELECT * FROM tblacademictype ORDER BY name";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $academicTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($academicTypes);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addAcademicType($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tblacademictype (name) VALUES (:name)";
        $stmt = $conn->prepare($sql);
        
        $name = $json['name'];
        
        $stmt->bindParam(':name', $name);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Academic type added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add academic type']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateAcademicType($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tblacademictype SET name = :name WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        $name = $json['name'];
        $id = $json['id'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Academic type updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update academic type']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteAcademicType($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if academic type is being used in grade levels
        $checkSql = "SELECT COUNT(*) as count FROM tblgradelevel WHERE academicTId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete academic type. It is being used in grade levels.']);
        }
        
        $sql = "DELETE FROM tblacademictype WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Academic type deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete academic type']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Section management functions
   function getSections()
   {
    include "connection.php";

    try {
        $sql = "SELECT 
                    s.id,
                    s.name,
                    s.gradeLevelId,
                    s.userId,
                    s.createdAt,
                    gl.name as gradeLevelName,
                    gl.id as gradeLevelId
                FROM tblsection s
                INNER JOIN tblgradelevel gl ON s.gradeLevelId = gl.id
                ORDER BY gl.name, s.name";
        $stmt = $conn->prepare($sql);
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

   function addSection($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tblsection (name, gradeLevelId, userId, createdAt) VALUES (:name, :gradeLevelId, :userId, NOW())";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $gradeLevelId = $json['gradeLevelId'];
        $userId = $json['userId'] ?? null;
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':gradeLevelId', $gradeLevelId);
        $stmt->bindParam(':userId', $userId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Section added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add section']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateSection($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tblsection SET name = :name, gradeLevelId = :gradeLevelId, userId = :userId WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        // Store values in variables to avoid bindParam reference issues
        $name = $json['name'];
        $gradeLevelId = $json['gradeLevelId'];
        $userId = $json['userId'] ?? null;
        $id = $json['id'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':gradeLevelId', $gradeLevelId);
        $stmt->bindParam(':userId', $userId);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Section updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update section']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteSection($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if section is being used in students
        $checkSql = "SELECT COUNT(*) as count FROM tblstudent WHERE sectionId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete section. It is being used by students.']);
        }
        
        $sql = "DELETE FROM tblsection WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Section deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete section']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Track management functions
   function getTracks()
   {
    include "connection.php";

    try {
        $sql = "SELECT * FROM tbltrack ORDER BY name";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($tracks);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addTrack($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tbltrack (name, createdAt) VALUES (:name, NOW())";
        $stmt = $conn->prepare($sql);
        
        $name = $json['name'];
        $stmt->bindParam(':name', $name);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Track added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add track']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateTrack($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tbltrack SET name = :name WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        $name = $json['name'];
        $id = $json['id'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Track updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update track']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteTrack($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if track is being used in strands
        $checkSql = "SELECT COUNT(*) as count FROM tblstrand WHERE trackId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete track. It is being used by strands.']);
        }
        
        $sql = "DELETE FROM tbltrack WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Track deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete track']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   // Strand management functions
   function getStrands()
   {
    include "connection.php";

    try {
        $sql = "SELECT 
                    s.id,
                    s.name,
                    s.trackId,
                    s.createdAt,
                    t.name as trackName
                FROM tblstrand s
                INNER JOIN tbltrack t ON s.trackId = t.id
                ORDER BY t.name, s.name";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $strands = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($strands);
        }
        return json_encode([]);
    } catch (PDOException $e) {
        return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
   }

   function addStrand($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "INSERT INTO tblstrand (name, trackId, createdAt) VALUES (:name, :trackId, NOW())";
        $stmt = $conn->prepare($sql);
        
        $name = $json['name'];
        $trackId = $json['trackId'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':trackId', $trackId);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Strand added successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to add strand']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function updateStrand($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        $sql = "UPDATE tblstrand SET name = :name, trackId = :trackId WHERE id = :id";
        $stmt = $conn->prepare($sql);
        
        $name = $json['name'];
        $trackId = $json['trackId'];
        $id = $json['id'];
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':trackId', $trackId);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Strand updated successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to update strand']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function deleteStrand($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    
    try {
        // Check if strand is being used in students
        $checkSql = "SELECT COUNT(*) as count FROM tblstudent WHERE strandId = :id";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bindParam(':id', $json['id']);
        $checkStmt->execute();
        $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($checkResult['count'] > 0) {
            return json_encode(['status' => 'error', 'message' => 'Cannot delete strand. It is being used by students.']);
        }
        
        $sql = "DELETE FROM tblstrand WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $json['id']);
        
        if ($stmt->execute()) {
            return json_encode(['status' => 'success', 'message' => 'Strand deleted successfully']);
        } else {
            return json_encode(['status' => 'error', 'message' => 'Failed to delete strand']);
        }
    } catch (PDOException $e) {
        return json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
   }

   function exportRequestAnalytics($json)
   {
    include "connection.php";
    $json = json_decode($json, true);
    $dateFrom = isset($json['dateFrom']) && !empty($json['dateFrom']) ? $json['dateFrom'] : null;
    $dateTo = isset($json['dateTo']) && !empty($json['dateTo']) ? $json['dateTo'] : null;

    try {
      // Fetch request status distribution
      $statusSql = "SELECT 
                s.name as status,
                COUNT(DISTINCT r.id) as count
              FROM tblrequest r
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus s ON rs.statusId = s.id
              WHERE rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )";
      if ($dateFrom) {
        $statusSql .= " AND DATE(rs.createdAt) >= :dateFrom";
      }
      if ($dateTo) {
        $statusSql .= " AND DATE(rs.createdAt) <= :dateTo";
      }
      $statusSql .= " GROUP BY s.id, s.name";
      $statusStmt = $conn->prepare($statusSql);
      if ($dateFrom) {
        $statusStmt->bindParam(':dateFrom', $dateFrom);
      }
      if ($dateTo) {
        $statusStmt->bindParam(':dateTo', $dateTo);
      }
      $statusStmt->execute();
      $statusRows = $statusStmt->fetchAll(PDO::FETCH_ASSOC);

      // Fetch completed requests details
      $completedSql = "SELECT 
                r.id,
                CONCAT(s.firstname, ' ', s.lastname) as student,
                d.name as document,
                r.purpose as freeTextPurpose,
                GROUP_CONCAT(DISTINCT p.name) as predefinedPurposes,
                DATE(r.createdAt) as dateRequested,
                DATE(rs.createdAt) as dateCompleted,
                st.name as status
              FROM tblrequest r
              INNER JOIN tbldocument d ON r.documentId = d.id
              INNER JOIN tblrequeststatus rs ON r.id = rs.requestId
              INNER JOIN tblstatus st ON rs.statusId = st.id
              INNER JOIN tblstudent s ON r.studentId = s.id
              LEFT JOIN tblrequestpurpose rp ON r.id = rp.requestId
              LEFT JOIN tblpurpose p ON rp.purposeId = p.id
              WHERE rs.id = (
                SELECT MAX(rs2.id) 
                FROM tblrequeststatus rs2 
                WHERE rs2.requestId = r.id
              )";
      if ($dateFrom) {
        $completedSql .= " AND DATE(rs.createdAt) >= :cDateFrom";
      }
      if ($dateTo) {
        $completedSql .= " AND DATE(rs.createdAt) <= :cDateTo";
      }
      $completedSql .= " GROUP BY r.id, s.firstname, s.lastname, d.name, r.purpose, r.createdAt, rs.createdAt, st.name";
      $completedSql .= " ORDER BY rs.createdAt DESC";
      
      $completedStmt = $conn->prepare($completedSql);
      if ($dateFrom) {
        $completedStmt->bindParam(':cDateFrom', $dateFrom);
      }
      if ($dateTo) {
        $completedStmt->bindParam(':cDateTo', $dateTo);
      }
      $completedStmt->execute();
      $completedRows = $completedStmt->fetchAll(PDO::FETCH_ASSOC);

      // Prepare CSV output
      $csvData = [];

      // Status Distribution Header
      $csvData[] = ["Request Status Distribution"];
      $csvData[] = ["Status", "Total Requests"];
      foreach ($statusRows as $stat) {
        $csvData[] = [$stat['status'], $stat['count']];
      }

      // Blank line between sections
      $csvData[] = [];

      // Completed Requests Header
      $csvData[] = ["Completed Requests"];
      $csvData[] = ["Student", "Document", "Purpose", "Requested Date", "Completed Date", "Status"];
      foreach ($completedRows as $request) {
        $csvData[] = [
          $request['student'], 
          $request['document'], 
          $request['freeTextPurpose'] . ' (' . $request['predefinedPurposes'] . ')', 
          $request['dateRequested'], 
          $request['dateCompleted'],
          $request['status']
        ];
      }

      // Output CSV
      header('Content-Type: text/csv');
      header('Content-Disposition: attachment; filename="request_analytics_' . date('Y-m-d') . '.csv"');
      
      $output = fopen('php://output', 'w');
      foreach ($csvData as $row) {
        fputcsv($output, $row);
      }
      fclose($output);
      exit;
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

  function resetPin($json) {
    include "connection.php";

    $json = json_decode($json, true);
    $userId = $json['userId'];
    $userType = $json['userType'];

    try {
      // Get last 4 digits of user ID as default PIN
      $defaultPin = substr($userId, -4);
      $hashedPin = password_hash($defaultPin, PASSWORD_DEFAULT);
      
      $table = ($userType === 'student') ? 'tblstudent' : 'tbluser';
      $sql = "UPDATE $table SET pinCode = :pin WHERE id = :userId";
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':pin', $hashedPin);
      $stmt->bindParam(':userId', $userId);
      
      if ($stmt->execute()) {
        return json_encode(['status' => 'success', 'message' => 'PIN reset successfully to last 4 digits of ID']);
      }
      return json_encode(['status' => 'error', 'message' => 'Failed to reset PIN']);
    } catch (PDOException $e) {
      return json_encode(['status' => 'error', 'message' => 'Database error occurred: ' . $e->getMessage()]);
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
  case "getRequestAnalytics":
    echo $user->getRequestAnalytics($json);
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
  case "getDocuments":
    echo $user->getDocuments();
    break;
  case "getRequirementTypes":
    echo $user->getRequirementTypes();
    break;
  case "addDocument":
    echo $user->addDocument($json);
    break;
  case "addRequirementType":
    echo $user->addRequirementType($json);
    break;
  case "updateDocument":
    echo $user->updateDocument($json);
    break;
  case "updateRequirementType":
    echo $user->updateRequirementType($json);
    break;
  case "deleteDocument":
    echo $user->deleteDocument($json);
    break;
  case "deleteRequirementType":
    echo $user->deleteRequirementType($json);
    break;
  case "getDocumentRequirements":
    echo $user->getDocumentRequirements();
    break;
  case "addDocumentRequirement":
    echo $user->addDocumentRequirement($json);
    break;
  case "deleteDocumentRequirement":
    echo $user->deleteDocumentRequirement($json);
    break;
  case "updateDocumentRequirements":
    echo $user->updateDocumentRequirements($json);
    break;
  case "getPurposes":
    echo $user->getPurposes();
    break;
  case "addPurpose":
    echo $user->addPurpose($json);
    break;
  case "updatePurpose":
    echo $user->updatePurpose($json);
    break;
  case "deletePurpose":
    echo $user->deletePurpose($json);
    break;
  case "getGradeLevels":
    echo $user->getGradeLevels();
    break;
  case "addGradeLevel":
    echo $user->addGradeLevel($json);
    break;
  case "updateGradeLevel":
    echo $user->updateGradeLevel($json);
    break;
  case "deleteGradeLevel":
    echo $user->deleteGradeLevel($json);
    break;
  case "getAcademicTypes":
    echo $user->getAcademicTypes();
    break;
  case "addAcademicType":
    echo $user->addAcademicType($json);
    break;
  case "updateAcademicType":
    echo $user->updateAcademicType($json);
    break;
  case "deleteAcademicType":
    echo $user->deleteAcademicType($json);
    break;
  case "getSections":
    echo $user->getSections();
    break;
  case "addSection":
    echo $user->addSection($json);
    break;
  case "updateSection":
    echo $user->updateSection($json);
    break;
  case "deleteSection":
    echo $user->deleteSection($json);
    break;
  case "activateUser":
    echo $user->activateUser($json);
    break;
  case "deactivateUser":
    echo $user->deactivateUser($json);
    break;
  case "exportRequestAnalytics":
    echo $user->exportRequestAnalytics($json);
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
  case "verifyCurrentPin": // New case for verifying current PIN
    echo $user->verifyCurrentPin($json);
    break;
  case "changePin": // New case for changing PIN
    echo $user->changePin($json);
    break;
  case "resetPin": // New case for resetting PIN
    echo $user->resetPin($json);
    break;
  case "getTracks":
    echo $user->getTracks();
    break;
  case "addTrack":
    echo $user->addTrack($json);
    break;
  case "updateTrack":
    echo $user->updateTrack($json);
    break;
  case "deleteTrack":
    echo $user->deleteTrack($json);
    break;
  case "getStrands":
    echo $user->getStrands();
    break;
  case "addStrand":
    echo $user->addStrand($json);
    break;
  case "updateStrand":
    echo $user->updateStrand($json);
    break;
  case "deleteStrand":
    echo $user->deleteStrand($json);
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}
?>