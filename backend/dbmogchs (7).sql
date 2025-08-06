-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 06, 2025 at 10:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbmogchs`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbldocument`
--

CREATE TABLE `tbldocument` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbldocument`
--

INSERT INTO `tbldocument` (`id`, `name`, `userId`, `createdAt`) VALUES
(5, 'SF10', '02-1819-01509', '2025-07-24 14:01:00'),
(6, 'Diploma', '02-1819-01509', '2025-07-24 14:01:00'),
(7, 'CAV', '02-1819-01509', '2025-07-24 14:01:00'),
(8, 'Certificate of Enrollment', '02-1819-01509', '2025-07-24 14:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `tblgradelevel`
--

CREATE TABLE `tblgradelevel` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblgradelevel`
--

INSERT INTO `tblgradelevel` (`id`, `name`, `userId`, `createdAt`) VALUES
(1, 'Grade 11', NULL, '2025-07-29 04:14:38'),
(2, 'Grade 12', NULL, '2025-07-29 04:14:38');

-- --------------------------------------------------------

--
-- Table structure for table `tblrequest`
--

CREATE TABLE `tblrequest` (
  `id` int(11) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `documentId` int(11) NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblrequeststatus`
--

CREATE TABLE `tblrequeststatus` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `statusId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblrequirements`
--

CREATE TABLE `tblrequirements` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `filepath` varchar(250) NOT NULL,
  `typeId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblrequirementstype`
--

CREATE TABLE `tblrequirementstype` (
  `id` int(11) NOT NULL,
  `nameType` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblrequirementstype`
--

INSERT INTO `tblrequirementstype` (`id`, `nameType`, `userId`, `createdAt`) VALUES
(1, 'Diploma', NULL, '2025-07-25 07:04:12'),
(2, 'Affidavit of Loss', NULL, '2025-07-25 07:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `tblschoolyear`
--

CREATE TABLE `tblschoolyear` (
  `id` int(11) NOT NULL,
  `year` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblschoolyear`
--

INSERT INTO `tblschoolyear` (`id`, `year`) VALUES
(1, '2022-2023'),
(2, '2023-2024'),
(3, '2024-2025'),
(4, '2025-2026');

-- --------------------------------------------------------

--
-- Table structure for table `tblsection`
--

CREATE TABLE `tblsection` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `gradeLevelId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsection`
--

INSERT INTO `tblsection` (`id`, `name`, `userId`, `gradeLevelId`, `createdAt`) VALUES
(1, 'Efficient', NULL, 1, '2025-07-30 15:42:15'),
(2, 'Elegant', NULL, 1, '2025-07-30 15:42:15'),
(3, 'Eligible', NULL, 1, '2025-07-30 15:42:15'),
(4, 'Eloquent', NULL, 1, '2025-07-30 15:42:15'),
(5, 'Empowered', NULL, 1, '2025-07-30 15:42:15'),
(6, 'Enduring', NULL, 1, '2025-07-30 15:42:15'),
(7, 'Enthusiasm', NULL, 1, '2025-07-30 15:42:15'),
(8, 'Evident', NULL, 1, '2025-07-30 15:42:15'),
(9, 'Raindrops', '02-1819-01500', 2, '2025-08-05 03:03:31'),
(10, 'Rooftop', '02-1819-01500', 2, '2025-08-05 03:03:31');

-- --------------------------------------------------------

--
-- Table structure for table `tblsfrecord`
--

CREATE TABLE `tblsfrecord` (
  `id` int(11) NOT NULL,
  `fileName` varchar(100) DEFAULT NULL,
  `studentId` varchar(50) NOT NULL,
  `gradeLevelId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblstatus`
--

CREATE TABLE `tblstatus` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstatus`
--

INSERT INTO `tblstatus` (`id`, `name`, `userId`, `createdAt`) VALUES
(1, 'Pending', NULL, '2025-07-24 13:52:56'),
(2, 'Processed', NULL, '2025-07-24 13:52:56'),
(3, 'Signatory', NULL, '2025-07-24 13:52:56'),
(4, 'Release', NULL, '2025-07-24 13:52:56'),
(5, 'Completed', NULL, '2025-07-24 13:52:56');

-- --------------------------------------------------------

--
-- Table structure for table `tblstrand`
--

CREATE TABLE `tblstrand` (
  `id` int(11) NOT NULL,
  `trackId` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstrand`
--

INSERT INTO `tblstrand` (`id`, `trackId`, `name`, `createdAt`) VALUES
(1, 1, 'STEM', '2025-08-06 10:58:22'),
(2, 1, 'TVL', '2025-08-06 10:58:22'),
(3, 1, 'ABM', '2025-08-06 10:58:22'),
(4, 1, 'HUMSS', '2025-08-06 10:58:22');

-- --------------------------------------------------------

--
-- Table structure for table `tblstudent`
--

CREATE TABLE `tblstudent` (
  `id` varchar(50) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `middlename` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userLevel` int(11) NOT NULL,
  `lrn` varchar(50) DEFAULT NULL,
  `strandId` int(11) DEFAULT NULL,
  `section` varchar(50) NOT NULL,
  `birthDate` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `completeAddress` text DEFAULT NULL,
  `fatherName` varchar(255) DEFAULT NULL,
  `motherName` varchar(255) DEFAULT NULL,
  `guardianName` varchar(255) DEFAULT NULL,
  `guardianRelationship` varchar(100) DEFAULT NULL,
  `sectionId` int(11) NOT NULL,
  `schoolyearId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblstudentdocument`
--

CREATE TABLE `tblstudentdocument` (
  `id` int(11) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `fileName` varchar(100) NOT NULL,
  `documentId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbltrack`
--

CREATE TABLE `tbltrack` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbltrack`
--

INSERT INTO `tbltrack` (`id`, `name`, `createdAt`) VALUES
(1, 'Academic ', '2025-08-06 10:57:59'),
(2, 'Sports', '2025-08-06 10:57:59');

-- --------------------------------------------------------

--
-- Table structure for table `tbluser`
--

CREATE TABLE `tbluser` (
  `id` varchar(50) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `middlename` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userLevel` int(11) NOT NULL,
  `pinCode` varchar(255) NOT NULL,
  `gradeLevelId` int(11) DEFAULT NULL,
  `sectionId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbluser`
--

INSERT INTO `tbluser` (`id`, `firstname`, `lastname`, `middlename`, `email`, `password`, `userLevel`, `pinCode`, `gradeLevelId`, `sectionId`) VALUES
('02-1819-01500', 'Patty', 'Aspiras', '', 'patty@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 1, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.', NULL, NULL),
('02-1819-01509', 'Patty', 'Aspiras', '', 'patty@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 2, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.', NULL, NULL),
('4771830', 'Maribelle', 'Acas', '', 'ralp.pelino11@gmail.com', '$2y$10$4Vv9PfU9GB41Ve/puKE9WOfPK5w.HFnl/rzpOnc.HVFjM1OMo1qda', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 1, 1),
('4771833', 'Alexis', 'Gonzaga', '', 'alex@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 2, 10),
('47718333', 'Mary', 'Aspiras', '', 'ralphjangallegos@gmail.com', '$2y$10$9J9.wB8P6YGynymCk.hVbebwAvqgtH6vRkZCjJiCUT9ZB09IaTd1a', 3, '$2y$10$YOD62VSS2kaYsIhX9LQqzOhs2AZ6Er0qdkakw4Gd67WxoeSgRk8wq', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tbluserlevel`
--

CREATE TABLE `tbluserlevel` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbluserlevel`
--

INSERT INTO `tbluserlevel` (`id`, `name`, `createdAt`) VALUES
(1, 'Registrar', '2025-07-23 08:43:05'),
(2, 'Admin', '2025-07-23 08:43:05'),
(3, 'Teacher', '2025-07-23 08:43:05'),
(4, 'Student', '2025-07-24 13:11:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbldocument`
--
ALTER TABLE `tbldocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblrequest`
--
ALTER TABLE `tblrequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`),
  ADD KEY `statusId` (`statusId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblschoolyear`
--
ALTER TABLE `tblschoolyear`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tblsection`
--
ALTER TABLE `tblsection`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `gradeLevelId` (`gradeLevelId`);

--
-- Indexes for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sfTypeId` (`gradeLevelId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblstatus`
--
ALTER TABLE `tblstatus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`userId`);

--
-- Indexes for table `tblstrand`
--
ALTER TABLE `tblstrand`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trackId` (`trackId`);

--
-- Indexes for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userLevel` (`userLevel`),
  ADD KEY `idx_student_lrn` (`lrn`),
  ADD KEY `idx_student_email` (`email`),
  ADD KEY `sectionId` (`sectionId`),
  ADD KEY `schoolyearId` (`schoolyearId`),
  ADD KEY `strandId` (`strandId`);

--
-- Indexes for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tbltrack`
--
ALTER TABLE `tbltrack`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbluser`
--
ALTER TABLE `tbluser`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_level` (`userLevel`),
  ADD KEY `gradeLevelId` (`gradeLevelId`),
  ADD KEY `fk_sectionId` (`sectionId`);

--
-- Indexes for table `tbluserlevel`
--
ALTER TABLE `tbluserlevel`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbldocument`
--
ALTER TABLE `tbldocument`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblrequest`
--
ALTER TABLE `tblrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblschoolyear`
--
ALTER TABLE `tblschoolyear`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tblsection`
--
ALTER TABLE `tblsection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblstatus`
--
ALTER TABLE `tblstatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblstrand`
--
ALTER TABLE `tblstrand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbltrack`
--
ALTER TABLE `tbltrack`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbluserlevel`
--
ALTER TABLE `tbluserlevel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbldocument`
--
ALTER TABLE `tbldocument`
  ADD CONSTRAINT `tbldocument_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  ADD CONSTRAINT `tblgradelevel_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblrequest`
--
ALTER TABLE `tblrequest`
  ADD CONSTRAINT `tblrequest_ibfk_1` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tblrequest_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`);

--
-- Constraints for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  ADD CONSTRAINT `tblrequeststatus_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`),
  ADD CONSTRAINT `tblrequeststatus_ibfk_2` FOREIGN KEY (`statusId`) REFERENCES `tblstatus` (`id`),
  ADD CONSTRAINT `tblrequeststatus_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  ADD CONSTRAINT `tblrequirements_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`),
  ADD CONSTRAINT `tblrequirements_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `tblrequirementstype` (`id`);

--
-- Constraints for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  ADD CONSTRAINT `tblrequirementstype_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblsection`
--
ALTER TABLE `tblsection`
  ADD CONSTRAINT `tblsection_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`),
  ADD CONSTRAINT `tblsection_ibfk_2` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`);

--
-- Constraints for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  ADD CONSTRAINT `tblsfrecord_ibfk_1` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`),
  ADD CONSTRAINT `tblsfrecord_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`),
  ADD CONSTRAINT `tblsfrecord_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblstatus`
--
ALTER TABLE `tblstatus`
  ADD CONSTRAINT `tblstatus_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblstrand`
--
ALTER TABLE `tblstrand`
  ADD CONSTRAINT `tblstrand_ibfk_1` FOREIGN KEY (`trackId`) REFERENCES `tbltrack` (`id`);

--
-- Constraints for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD CONSTRAINT `tblstudent_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_2` FOREIGN KEY (`sectionId`) REFERENCES `tblsection` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_3` FOREIGN KEY (`schoolyearId`) REFERENCES `tblschoolyear` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_4` FOREIGN KEY (`strandId`) REFERENCES `tblstrand` (`id`);

--
-- Constraints for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  ADD CONSTRAINT `tblstudentdocument_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`),
  ADD CONSTRAINT `tblstudentdocument_ibfk_2` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tblstudentdocument_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tbluser`
--
ALTER TABLE `tbluser`
  ADD CONSTRAINT `fk_sectionId` FOREIGN KEY (`sectionId`) REFERENCES `tblsection` (`id`),
  ADD CONSTRAINT `tbluser_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`),
  ADD CONSTRAINT `tbluser_ibfk_2` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
