-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 18, 2025 at 06:01 AM
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
-- Table structure for table `sms_logs`
--

CREATE TABLE `sms_logs` (
  `id` int(11) NOT NULL,
  `to_number` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'sent'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sms_logs`
--

INSERT INTO `sms_logs` (`id`, `to_number`, `message`, `sent_at`, `status`) VALUES
(1, '+639056548089', 'asd', '2025-08-12 04:46:15', 'failed');

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
-- Table structure for table `tblreleaseschedule`
--

CREATE TABLE `tblreleaseschedule` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `dateSchedule` date NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Dumping data for table `tblrequest`
--

INSERT INTO `tblrequest` (`id`, `studentId`, `documentId`, `purpose`, `createdAt`) VALUES
(1, '22-2222-2222', 6, 'College Application', '2025-08-06 06:03:42'),
(2, '22-2222-2222', 5, 'College Application', '2025-08-06 06:46:44'),
(4, '33333333', 5, 'shesh', '2025-08-10 10:02:50'),
(5, '33333333', 8, 'hehe', '2025-08-10 10:45:26'),
(6, '33333333', 7, 'for work', '2025-08-17 03:03:28');

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

--
-- Dumping data for table `tblrequeststatus`
--

INSERT INTO `tblrequeststatus` (`id`, `requestId`, `statusId`, `userId`, `createdAt`) VALUES
(1, 1, 1, NULL, '2025-08-06 06:03:42'),
(2, 2, 1, NULL, '2025-08-06 06:46:44'),
(4, 4, 1, NULL, '2025-08-10 10:02:50'),
(5, 5, 1, NULL, '2025-08-10 10:45:26'),
(6, 6, 1, NULL, '2025-08-17 03:03:28');

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

--
-- Dumping data for table `tblrequirements`
--

INSERT INTO `tblrequirements` (`id`, `requestId`, `filepath`, `typeId`, `createdAt`) VALUES
(1, 1, '521827746_1955938708539586_392632500952961470_n.jpg', 2, '2025-08-06 06:03:42'),
(2, 6, '494824206_3916111231987718_6769723710186800158_n.jpg', 1, '2025-08-17 03:03:28');

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

--
-- Dumping data for table `tblsfrecord`
--

INSERT INTO `tblsfrecord` (`id`, `fileName`, `studentId`, `gradeLevelId`, `userId`, `createdAt`) VALUES
(1, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128164140135', 1, '02-1819-01500', '2025-08-06 17:22:32'),
(2, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964120138', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(3, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140437', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(4, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120016', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(5, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140219', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(6, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '133218140022', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(7, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '136913130093', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(8, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993150140', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(9, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140395', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(10, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955160159', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(11, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127967140004', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(12, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127992130267', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(13, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126917140008', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(14, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '117851130016', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(15, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127739130002', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(16, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140193', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(17, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140983', 1, '02-1819-01500', '2025-08-06 17:22:33'),
(18, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '510062400004', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(19, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130399', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(20, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940141023', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(21, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '201511140006', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(22, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405241150066', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(23, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130057', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(24, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140316', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(25, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993140162', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(26, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127967140604', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(27, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127956120328', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(28, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120831', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(29, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '132287150182', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(30, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140607', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(31, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126577140110', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(32, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955080148', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(33, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405155150193', 1, '02-1819-01500', '2025-08-06 17:22:34'),
(34, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140743', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(35, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140398', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(36, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140980', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(37, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131632140039', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(38, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941130349', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(39, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127867140141', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(40, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127956140332', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(41, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141346', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(42, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140331', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(43, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127966120298', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(44, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140475', 1, '02-1819-01500', '2025-08-06 17:22:35'),
(48, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995120980', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(49, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127992140071', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(50, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958120001', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(51, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405235150610', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(52, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '132050130173', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(53, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126421150124', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(54, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140626', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(55, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126625130035', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(56, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942130392', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(57, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150938', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(58, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127963130087', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(59, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '104819130115', 1, '02-1819-01500', '2025-08-06 20:31:20'),
(60, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '118350130019', 1, '02-1819-01500', '2025-08-06 20:31:21'),
(61, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140389', 1, '02-1819-01500', '2025-08-06 20:31:21'),
(62, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126625130039', 1, '02-1819-01500', '2025-08-06 20:31:21'),
(72, 'SF10 - Patty - grade 12.xlsx', '33333333', 1, '4771830', '2025-08-17 21:57:54'),
(73, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-CANONCEsample.xlsx', '22-2222-2222', 1, '4771830', '2025-08-17 21:57:54');

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
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `userLevel` int(11) NOT NULL,
  `lrn` varchar(50) DEFAULT NULL,
  `strandId` int(11) DEFAULT NULL,
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

--
-- Dumping data for table `tblstudent`
--

INSERT INTO `tblstudent` (`id`, `firstname`, `middlename`, `lastname`, `email`, `password`, `userLevel`, `lrn`, `strandId`, `birthDate`, `age`, `religion`, `completeAddress`, `fatherName`, `motherName`, `guardianName`, `guardianRelationship`, `sectionId`, `schoolyearId`, `createdAt`, `updatedAt`) VALUES
('104819130115', 'MIKAELA', 'ESTOQUE', 'BUNGCAYAO', 'mikaela.bungcayao@student.mogchs.edu.ph', '$2y$10$269ejV/FS3bN1Y9Ak.ycAupGWEgvrH5omJ2XZyzYsmkGQjv4fiaQ.', 4, '104819130115', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('117851130016', 'STEPHEN', 'CABALLERO', 'JOHNSON', 'stephen.johnson@student.mogchs.edu.ph', '$2y$10$5kCOu3DVlR0UohSVVM12c.4w.dOMJDJnqMm5enjzxBX/LEh4uhmHO', 4, '117851130016', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('118350130019', 'PEARL', 'MARIE AMPARO', 'PERILLO', 'pearl.perillo@student.mogchs.edu.ph', '$2y$10$Af8vQzGDdZBcu6UJn/vEgOcleXLxy8ubN7Dzvt/B/Ke.mKrGBUFaC', 4, '118350130019', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:21', '2025-08-06 12:31:21'),
('126421150124', 'ALDREEVE', '-', 'COMPOSA', 'aldreeve.composa@student.mogchs.edu.ph', '$2y$10$KUUfW3ldrgt2Sxjp89P46O1wpsYU63WNL5JoRxLwwcevi/xJpORWu', 4, '126421150124', 4, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('126577140110', 'JELYN', 'ORONG', 'GUINLAMON', 'jelyn.guinlamon@student.mogchs.edu.ph', '$2y$10$2CSdpQ0kcTH1t/jLo4ggUOh6Iqtj7NUJ7XsQfPU1z4lWbpdgxio2e', 4, '126577140110', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('126625130035', 'JAY', 'DAVE TEOFILO', 'GICA', 'jay.gica@student.mogchs.edu.ph', '$2y$10$HgYyogvVFGSW8rQAQKrO2OrN1JAPgOLO3SOSoyK9ydxcMRySph86y', 4, '126625130035', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('126625130039', 'NICOLE', 'DAVE TAYCO', 'TEOFILO', 'nicole.teofilo@student.mogchs.edu.ph', '$2y$10$cTzp1NhgGpZ/fj9qWh0WUuu/qQwfWffc2A8HfBowU6AYd5qP/wY2W', 4, '126625130039', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:21', '2025-08-06 12:31:21'),
('126917140008', 'JHANSSEN', 'DEMETERIO', 'GONZALES', 'jhanssen.gonzales@student.mogchs.edu.ph', '$2y$10$tU.4Nsv3fDQDtQRyI8Mdl.YAvIFFAKqbB8msfR4st5NKP/UbyPyRe', 4, '126917140008', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127739130002', 'ZACHARY', 'JOFER MONTEJO', 'JUELE', 'zachary.juele@student.mogchs.edu.ph', '$2y$10$Fme3fnb.h8lJsK71cjXtoO3zqwQwF1gT/UTwuUTXjFwcRYjJ02y5K', 4, '127739130002', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127867140141', 'PRINCESS', 'NICOLE UNABIA', 'SARANGA', 'princess.saranga@student.mogchs.edu.ph', '$2y$10$R5gePJCxdAmnmzWiUogT1OiZTLjaSPGMDfeNNKKhvVMay.WVv0saW', 4, '127867140141', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127940120016', 'JHON', 'ELMER CAILING', 'BALDONADE', 'jhon.baldonade@student.mogchs.edu.ph', '$2y$10$3Lli4p7QIa62v6biTpdpu.Tb1jYd6ra5U55fsZFWkrxNey59Lwwpq', 4, '127940120016', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127940120831', 'AVA', 'KRISTA MARCELINO', 'CABAYACRUZ', 'ava.cabayacruz@student.mogchs.edu.ph', '$2y$10$LyH5m3.UlCVtpqOZ4RTg3uvVgprT3bKosfoEoPvKGaOt.RKhX2i5i', 4, '127940120831', 1, '0000-00-00', 19, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127940140193', 'LOUISE', 'MIGUEL SUMAMPONG', 'KUIZON', 'louise.kuizon@student.mogchs.edu.ph', '$2y$10$/jACQmxet19xRVSrN69EbOfRy3L0qB.aTGmnSbckkWw1FVbGvaJZK', 4, '127940140193', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127940140219', 'ALJADE', 'METODA', 'CABAÑEROS', 'aljade.cabaeros@student.mogchs.edu.ph', '$2y$10$J82qP05HssaiR9ORRzD32OFaIK3m9ktz9ub9jcdhiqu/8cjrsvATu', 4, '127940140219', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127940140437', 'JOEL', 'CUTANDA', 'AMPER', 'joel.amper@student.mogchs.edu.ph', '$2y$10$sRS1wPPN8BqHlPHcwn0nouz6Ekp9bM4tkPL0LnJJluFtB0HJc0tAq', 4, '127940140437', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127940140626', 'KENT', 'PATRICK MONDILLA', 'ESCABARTE', 'kent.escabarte@student.mogchs.edu.ph', '$2y$10$W0ZBUr1Wy635ukqQdSdb5.LhjexizWppjahpxhg9NW76E/sYSt6fq', 4, '127940140626', 4, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127940140743', 'JENNIFER', 'GONZAGA', 'OCLARIT', 'jennifer.oclarit@student.mogchs.edu.ph', '$2y$10$Tfe5NfYPTJmUscOedjJmIOei93Svhw7r8SR6SSzmkoxRUUcl/U1UO', 4, '127940140743', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127940140983', 'SANTINO', 'RHYNE CAW-IT', 'LONGGAKIT', 'santino.longgakit@student.mogchs.edu.ph', '$2y$10$ExBGeyT1JQFN.j0VJiQXBeEUQAmxMGvgCGnPB.kE7.3TtXbNggV2G', 4, '127940140983', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127940141023', 'HUNLEY', 'GEMILLA', 'PADIÑO', 'hunley.padio@student.mogchs.edu.ph', '$2y$10$tVy2mRACg55ZC2Tts9dosOLroSf.sBuu/y/rWzW.4BBKy6HNa/Hsa', 4, '127940141023', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127940150938', 'EDZEHL', 'JAKIM PALER', 'SAMSON', 'edzehl.samson@student.mogchs.edu.ph', '$2y$10$tW5dJ5XEo0GeztpoDZ7cs.Aevdn2ZYgUIfH7cTmaapDCizhtVWfNK', 4, '127940150938', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127941130349', 'RAYSHELLE', 'SALARDA', 'REALISTA', 'rayshelle.realista@student.mogchs.edu.ph', '$2y$10$3uHgoK..ReUT65danoZtIegWg0va4mRil8eqCI73HVRYgPCK9NrYm', 4, '127941130349', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127941140331', 'JUSTINE', 'MAE MENDOZA', 'YANO', 'justine.yano@student.mogchs.edu.ph', '$2y$10$nc4yZBzE4N6.mLQmrIXS2eVaVgb9ZYzYS1PzuAs/0Yz3ckokv2iFu', 4, '127941140331', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127941140398', 'LEXXY', 'REALISTA', 'PAHUNANG', 'lexxy.pahunang@student.mogchs.edu.ph', '$2y$10$3wxE1SaOsSz/sZT5WYuhN.X05u5Qr9zQAO95gLqujrXWtby71/txu', 4, '127941140398', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127941140475', 'SHERRY', 'DELA CRUZ', 'YOUNG', 'sherry.young@student.mogchs.edu.ph', '$2y$10$km1DnNYYzHddvTa9qaEA5.VPz0KtjKWk60e9RZcqW2CIUXZ6vLpK2', 4, '127941140475', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127942130392', 'ANDRE', 'QUINTO', 'JORILLA', 'andre.jorilla@student.mogchs.edu.ph', '$2y$10$xUk/l.gEnjRK3XLeAjyEiu7wqBX.B5SLqi5qb5bRduk8GNbtz8ycO', 4, '127942130392', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127942140389', 'TRECIA', 'JOYCE TACULOD', 'RODRIGUEZ', 'trecia.rodriguez@student.mogchs.edu.ph', '$2y$10$xK3AGvtwefouKIuCxjeoFOWCO56CSyatBQQ.HHjQrvyMyRYcCkeHe', 4, '127942140389', 4, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:21', '2025-08-06 12:31:21'),
('127942140607', 'JESSA', 'LASTIMOSO', 'GENTAPA', 'jessa.gentapa@student.mogchs.edu.ph', '$2y$10$Hz94DWrOMAfATlU1oNnu1ecbsyzM5QQZqkiDSlVruRHdt.U2gLTPG', 4, '127942140607', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127955080148', 'NASIFAH', 'BATUA', 'H SAID', 'nasifah.hsaid@student.mogchs.edu.ph', '$2y$10$J4.ftyUJk36UvRwFOYIfsuudwq6VdiWfAkn/3qOUJB6RmbNrXTwqK', 4, '127955080148', 1, '0000-00-00', 25, 'Islam', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127955130057', 'KRAM', 'EMPIALES', 'SALAS', 'kram.salas@student.mogchs.edu.ph', '$2y$10$gibKen/JsWDBAeUdU9ci3OKm8XSEmdxcyZo8E2AyBvapXBYQ8vfTy', 4, '127955130057', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127955130399', 'RICKMERS', 'BASLI-AN', 'MINISTER', 'rickmers.minister@student.mogchs.edu.ph', '$2y$10$gN4msZUevNfA6Te8zKPw0.2NFYQj4elsbmNejmiBp0p4lILH/pr.C', 4, '127955130399', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127955160159', 'JEAMWHELL', 'DINOPOL', 'GENERALAO', 'jeamwhell.generalao@student.mogchs.edu.ph', '$2y$10$XFNXe/hwNZghVowH4mIk3OmsJe.cF/cNKf12wZTCUrq2ehkwcd0VW', 4, '127955160159', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127956120328', 'MARICEL', '-', 'CABACTULAN', 'maricel.cabactulan@student.mogchs.edu.ph', '$2y$10$GwpRrKFmn.rubflB8SiKXuuTI3L6bmZbluoWrw9/gO/anRSM0POCe', 4, '127956120328', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127956140332', 'SAMANTHA', 'ABECIA', 'TIBURON', 'samantha.tiburon@student.mogchs.edu.ph', '$2y$10$S9eB6paJRBY0/dI9U5bh7Oo9YS6QtHMrCPYfDgJr9jw.OUymyEfhK', 4, '127956140332', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127958120001', 'SAMUEL', 'TURA', 'ALOZO', 'samuel.alozo@student.mogchs.edu.ph', '$2y$10$bfyRIy.z69RejScgHL2pKuEv24xzJkmYwLv8.AshG.Aqbg7zZsgb6', 4, '127958120001', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127963130087', 'KHALEL', 'JO ANG', 'AMARGA', 'khalel.amarga@student.mogchs.edu.ph', '$2y$10$DZHaBT.T9hTIwEJxKsTFxOyw04SK7BrVX9Yq/uE5Jh/kx5r12UYku', 4, '127963130087', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127964120138', 'ULYAR', 'DAIRO', 'ALFANTE', 'ulyar.alfante@student.mogchs.edu.ph', '$2y$10$PNkRAHNW6EN6E2z444tatOQq0d0eKqzkQtVt7cQiB2pSfplPxxIN6', 4, '127964120138', 1, '0000-00-00', 19, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127966120298', 'RAMELLA', 'BONCALES', 'YORDAN', 'ramella.yordan@student.mogchs.edu.ph', '$2y$10$PEgc8tM/5Dm9WBwHLcRr6el8sLxpjDUWI0avrd0WJ/CyUk0vtzZmi', 4, '127966120298', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127967140004', 'KING', 'CHANDLER MENDEZ', 'GENTILES', 'king.gentiles@student.mogchs.edu.ph', '$2y$10$yqGM0YvTSC1X4EEeXcu0qu5gACvapDy9MYQVv4K2oEj4nc/RyxcR.', 4, '127967140004', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127967140604', 'ALFRED', 'ANTIPAS', 'YAP', 'alfred.yap@student.mogchs.edu.ph', '$2y$10$oyvhffhmL.Mgb6vU7zb/Ru0ws1V4A70ExpBXNrpRlhHvWFI7SFrbO', 4, '127967140604', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127992130267', 'WIN', 'RAPIRAP', 'GO', 'win.go@student.mogchs.edu.ph', '$2y$10$5eUD8MWtVWy.IpfUF7aa6uSfcxiVI./EyC7u5oKW1fV35DIi1dtWm', 4, '127992130267', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127992140071', 'ED', 'RYAN PIMENTEL', 'ABELLON', 'ed.abellon@student.mogchs.edu.ph', '$2y$10$0WKaNfPzct8u7BNs6aJ3TOOe00XMvE/gE9T2DdPD.pKag15GR9d9C', 4, '127992140071', 4, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127993140162', 'JETRRY', 'GABUT', 'SIBOC', 'jetrry.siboc@student.mogchs.edu.ph', '$2y$10$Y92xjmKqznNSN4Io3PFt.eHCsQVDKpEW8gprXhq6aibog0Kx0yuDm', 4, '127993140162', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127993150140', 'JOHN', 'VINCENT -', 'ESPADILLA', 'john.espadilla@student.mogchs.edu.ph', '$2y$10$fbtwSoWLgViYSxx5Oe2nke.VovbfD8ROBuM1qhkj0hzIX0NzeyHv6', 4, '127993150140', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127995120980', 'MARK', 'ANTHONY RACAL', 'ABELLANOSA', 'mark.abellanosa@student.mogchs.edu.ph', '$2y$10$mIiG./DbJU8Ww47Hllx2POCe9CpcxjXGwiO9zcV/FgKufy.xj8GZ.', 4, '127995120980', 4, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('127995140316', 'RANDY', 'JR CUICO', 'SALVADOR', 'randy.salvador@student.mogchs.edu.ph', '$2y$10$OZad5QApu0iHnaReaehFJO9Pcq8B9dqIW9DHqC4aNEK/62AiVLs5G', 4, '127995140316', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('127995140395', 'MARK', 'SEBASTIAN GALOPE', 'FABRIA', 'mark.fabria@student.mogchs.edu.ph', '$2y$10$5oVemUhlQ.RuukkuY0E6kupA5L55lhKxnKX4ErG8dWKtnZC3L3x5C', 4, '127995140395', 1, '0000-00-00', 19, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('127995140980', 'ELLYZA', 'YASOL', 'PILO', 'ellyza.pilo@student.mogchs.edu.ph', '$2y$10$hFFf.SyiJg5.8JfggTX61.fOcgt6sZ/Thy/lAEMSb7ndjIZ8hs77.', 4, '127995140980', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('127995141346', 'PRINCESS', 'ALTHEA NADELA', 'YAMUT', 'princess.yamut@student.mogchs.edu.ph', '$2y$10$hk2jci7NhwQUbWYdR0baduZD5bmlffZGLMN82hEGTewKIINcKzpqG', 4, '127995141346', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('128164140135', 'JABEZ', 'YORONG', 'ACAPULCO', 'jabez.acapulco@student.mogchs.edu.ph', '$2y$10$s1kMWqni0o7dNqCOlkrz2uzWcwsN08y8NjfzhkMsIYZhTKtEvWpbG', 4, '128164140135', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:32', '2025-08-06 09:22:32'),
('131632140039', 'JOELIE', 'MARIE MARIQUIT', 'RABAGO', 'joelie.rabago@student.mogchs.edu.ph', '$2y$10$m0Esz13rINPaIVFN7GbSoeXXzwdkzawclu2HJkI29Oz2.1XjI0KlC', 4, '131632140039', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:35', '2025-08-06 09:22:35'),
('132050130173', 'JUMAR', 'BUSANO', 'CELERES', 'jumar.celeres@student.mogchs.edu.ph', '$2y$10$w3wAVnnPfVrJqsOWM7qIlexpalDDUHepu8HuN/RAye6nfMMr214F6', 4, '132050130173', 4, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('132287150182', 'DANICE', 'ROSS XENIA ESTRELLA', 'GALVAN', 'danice.galvan@student.mogchs.edu.ph', '$2y$10$lw.chcBSsYo/t.ciETdgR.jvgo7ZuIVwucMsr2z7B5h43ortNWX.O', 4, '132287150182', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('133218140022', 'JAPAR', 'DIBA', 'DAUD', 'japar.daud@student.mogchs.edu.ph', '$2y$10$JTk6OVTBmD/MEzXEXjA8N.wTzxMKTNkLgXP5MkNbTLMNcH4Hw4C.O', 4, '133218140022', 1, '0000-00-00', 16, 'Islam', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('136913130093', 'HERMINE', 'GUMBAY', 'DIMASINSIL', 'hermine.dimasinsil@student.mogchs.edu.ph', '$2y$10$OzU8pLquAHGZpSqqgpDvbeJwoPBEQ3T99Hepo2naBN0A5cP.3lgum', 4, '136913130093', 1, '0000-00-00', 17, 'Islam', '', '', '', '', '', 3, 4, '2025-08-06 09:22:33', '2025-08-06 09:22:33'),
('201511140006', 'CARL', 'KESTER LIGUTOM', 'PELIGRO', 'carl.peligro@student.mogchs.edu.ph', '$2y$10$ekIKipYY8hNdEUwNjaG0CeVhZ9pIk19DZfWCbFUZ7uwLEaE2QBNSW', 4, '201511140006', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('22-2222-2222', 'Mary', '', 'Canonce', 'rape.gallegos.coc@phinmaed.com', '$2y$10$1NWwcwH/L8sWlNQvMqyuquNXriD9HlsvB8V3bgt8tzjb6N4vEZmdm', 4, '22-2222-2222', 1, '2002-02-22', 22, 'Roman Catholic', 'Iponan', '', '', '', '', 3, 4, '2025-08-06 09:48:41', '2025-08-17 13:45:54'),
('33333333', 'Patricia', '', 'Aspirass', 'pattyaspiras@gmail.com', '$2y$10$bkhlAH8VfrdRfB9Kuu6HverJ2jFJ83a8wCrn9DIiJ0.SFlxvT5u.q', 4, '33333333', 4, '2003-02-21', 20, 'Roman Catholic', 'Iponan', 'ralph jan gallegos', '', '', '', 3, 4, '2025-08-06 12:42:47', '2025-08-17 13:16:12'),
('405155150193', 'MARICEL', 'SIBOLON', 'MANOS', 'maricel.manos@student.mogchs.edu.ph', '$2y$10$8ExvtvZGLgb.Vj8S/fYwx.7GgQaXjldhUDJMsTXf0mRUSrAoC6oTm', 4, '405155150193', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('405235150610', 'MARC', 'GABRIEL MACALAM', 'ANDOY', 'marc.andoy@student.mogchs.edu.ph', '$2y$10$D6jsrHPkSMBWQFnITRZJF.1FOh78eqBrmY1FP2rw9OkAaIkTjA55i', 4, '405235150610', 4, '0000-00-00', 20, 'Christianity', '', '', '', '', '', 2, 4, '2025-08-06 12:31:20', '2025-08-06 12:31:20'),
('405241150066', 'ARJAY', 'PALMARES', 'REYES', 'arjay.reyes@student.mogchs.edu.ph', '$2y$10$wIQktkFy37H7TGzYE3vuie2HU1pezlSmKwS8OFmEyN8EDzPFzWxoK', 4, '405241150066', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('44444444', 'John', '', 'Doe', 'ralphjanpelino@gmail.com', '$2y$10$mfu9gSoChPrDytBex.O/Te8QRO88.O/ZWtYqMr6FBcMrz01sAJGGK', 4, '44444444', 2, '2001-11-08', 23, 'Roman Catholic', 'Iponan', '', '', '', '', 2, 4, '2025-08-11 13:28:31', '2025-08-11 13:28:31'),
('510062400004', 'JOHAYVER', 'CALIPAPA', 'MAKI', 'johayver.maki@student.mogchs.edu.ph', '$2y$10$fiDYe3jG.9PUg2tiT199eOD8.qa9UNMiQ89zfTWALuAi0mwHXGDzi', 4, '510062400004', 1, '0000-00-00', 18, 'Islam', '', '', '', '', '', 3, 4, '2025-08-06 09:22:34', '2025-08-06 09:22:34'),
('55555', 'Marry', '', 'Canonce', NULL, '$2y$10$Kh.lheyanVdPQ93IhSKWXOXdb6H078NQISywtuunTTmjnMlD2iEc2', 4, '55555', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1, '2025-08-12 06:35:56', '2025-08-12 06:35:56'),
('66666', 'Patricia', '', 'Patty', NULL, '$2y$10$N3J0Lj.ZfxUL34AGW5IPme3Rnja8HAcWtcUyn7VY/tYet2mYobpz2', 4, '66666', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 2, '2025-08-12 06:35:56', '2025-08-12 06:35:56');

-- --------------------------------------------------------

--
-- Table structure for table `tblstudentdocument`
--

CREATE TABLE `tblstudentdocument` (
  `id` int(11) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `fileName` varchar(100) NOT NULL,
  `documentId` int(11) NOT NULL,
  `gradeLevelId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstudentdocument`
--

INSERT INTO `tblstudentdocument` (`id`, `studentId`, `fileName`, `documentId`, `gradeLevelId`, `userId`, `createdAt`) VALUES
(7, '66666', 'SF10 - Patty.pdf', 5, 2, NULL, '2025-08-12 14:35:56'),
(12, '33333333', 'SF10 - Patty22.pdf', 5, 1, '4771830', '2025-08-17 22:01:21'),
(13, '22-2222-2222', 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-CANONCEsample.pdf', 5, 1, '4771830', '2025-08-17 22:01:21');

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
  `email` varchar(50) DEFAULT NULL,
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
('02-22240755', 'krystyll', 'Plaza', '', 'krystyllp@gmail.com', '$2y$10$kdoseuywdW9Qa5zy6Wk9.OGLfDnyee.xJAaro9nA2w1ZeFV/tC2Xe', 2, '$2y$10$tGS6ocEEixbxH4APISaJHe6PUWfGlWhk1l7EdAtSYoJqIrt2rYd.2', NULL, NULL),
('0222240755', 'krystyll', 'plaza', '', 'krystyllp@gmail.com', '$2y$10$FeQhThcTYXdfl/a0dLmPIuYzFRxwLQR4SrQGRsMqX/mtxf1apUWRK', 2, '$2y$10$JIuhsatF8O/fPkmACqwaauC7qOZcyQ5HqtATz.QlbBnE08Aqeyrba', NULL, NULL),
('4771830', 'Maribelle', 'Acas', '', 'ralp.pelino11@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 1, 3),
('4771833', 'Alexis', 'Gonzaga', '', 'alex@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 2, 10),
('47718333', 'Mary', 'Aspiras', '', 'ralphjangallegos@gmail.com', '$2y$10$JooVcuK3ntZQdiPGcAhvle9y1Q9z0vKeeDJWui0ybvjLgXYcZboNq', 3, '$2y$10$YOD62VSS2kaYsIhX9LQqzOhs2AZ6Er0qdkakw4Gd67WxoeSgRk8wq', 1, 2);

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
-- Indexes for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`),
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
  ADD KEY `userId` (`userId`),
  ADD KEY `gradeLevelId` (`gradeLevelId`);

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
-- AUTO_INCREMENT for table `sms_logs`
--
ALTER TABLE `sms_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- AUTO_INCREMENT for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblrequest`
--
ALTER TABLE `tblrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
-- Constraints for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  ADD CONSTRAINT `tblreleaseschedule_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`),
  ADD CONSTRAINT `tblreleaseschedule_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

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
  ADD CONSTRAINT `tblstudentdocument_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`),
  ADD CONSTRAINT `tblstudentdocument_ibfk_4` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`);

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
