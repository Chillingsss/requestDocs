-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 20, 2025 at 11:20 AM
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
-- Table structure for table `tbldocumentrequirement`
--

CREATE TABLE `tbldocumentrequirement` (
  `id` int(11) NOT NULL,
  `documentId` int(11) NOT NULL,
  `requirementTId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbldocumentrequirement`
--

INSERT INTO `tbldocumentrequirement` (`id`, `documentId`, `requirementTId`, `userId`, `createdAt`) VALUES
(1, 7, 1, '02-1819-01509', '2025-08-20 11:19:15'),
(2, 6, 2, '02-1819-01509', '2025-08-20 11:19:15'),
(3, 5, 3, '02-1819-01509', '2025-08-20 11:20:26');

-- --------------------------------------------------------

--
-- Table structure for table `tblforgotlrn`
--

CREATE TABLE `tblforgotlrn` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `is_processed` tinyint(1) NOT NULL DEFAULT 0,
  `processed_by` varchar(50) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblforgotlrn`
--

INSERT INTO `tblforgotlrn` (`id`, `firstname`, `lastname`, `email`, `is_processed`, `processed_by`, `processed_at`, `created_at`) VALUES
(1, 'Patty', 'Aspiras', 'rape.gallegos.coc@phinmaed.com', 1, '02-1819-01500', '2025-08-19 21:53:22', '2025-08-19 21:36:33'),
(2, 'Patricia', 'Aspiras', 'rape.gallegos.coc@phinmaed.com', 1, '02-1819-01500', '2025-08-19 21:58:45', '2025-08-19 21:55:04');

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

--
-- Dumping data for table `tblreleaseschedule`
--

INSERT INTO `tblreleaseschedule` (`id`, `requestId`, `userId`, `dateSchedule`, `createdAt`) VALUES
(5, 1, '02-1819-01500', '2025-08-25', '2025-08-18 12:46:41'),
(6, 4, '02-1819-01500', '2025-08-25', '2025-08-20 16:09:25');

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
(6, 6, 1, NULL, '2025-08-17 03:03:28'),
(7, 1, 2, NULL, '2025-08-18 12:21:40'),
(8, 1, 3, NULL, '2025-08-18 12:21:41'),
(10, 1, 4, NULL, '2025-08-18 12:46:45'),
(11, 4, 2, NULL, '2025-08-20 04:09:10'),
(12, 4, 3, NULL, '2025-08-20 04:09:11'),
(13, 4, 4, NULL, '2025-08-20 04:09:29');

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
(2, 'Affidavit of Loss', NULL, '2025-07-25 07:04:12'),
(3, 'Request Letter', '02-1819-01509', '2025-08-20 11:20:10');

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
(73, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-CANONCEsample.xlsx', '22-2222-2222', 1, '4771830', '2025-08-17 21:57:54'),
(74, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128164140135', 1, '4771830', '2025-08-18 17:41:40'),
(75, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964120138', 1, '4771830', '2025-08-18 17:41:41'),
(76, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140437', 1, '4771830', '2025-08-18 17:41:41'),
(77, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120016', 1, '4771830', '2025-08-18 17:41:41'),
(78, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140219', 1, '4771830', '2025-08-18 17:41:41'),
(79, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '133218140022', 1, '4771830', '2025-08-18 17:41:41'),
(80, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '136913130093', 1, '4771830', '2025-08-18 17:41:41'),
(81, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993150140', 1, '4771830', '2025-08-18 17:41:41'),
(82, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140395', 1, '4771830', '2025-08-18 17:41:41'),
(83, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955160159', 1, '4771830', '2025-08-18 17:41:41'),
(84, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127967140004', 1, '4771830', '2025-08-18 17:41:41'),
(85, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127992130267', 1, '4771830', '2025-08-18 17:41:41'),
(86, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126917140008', 1, '4771830', '2025-08-18 17:41:41'),
(87, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '117851130016', 1, '4771830', '2025-08-18 17:41:41'),
(88, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127739130002', 1, '4771830', '2025-08-18 17:41:41'),
(89, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140193', 1, '4771830', '2025-08-18 17:41:41'),
(90, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140983', 1, '4771830', '2025-08-18 17:41:42'),
(91, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '510062400004', 1, '4771830', '2025-08-18 17:41:42'),
(92, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130399', 1, '4771830', '2025-08-18 17:41:42'),
(93, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940141023', 1, '4771830', '2025-08-18 17:41:42'),
(94, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '201511140006', 1, '4771830', '2025-08-18 17:41:42'),
(95, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405241150066', 1, '4771830', '2025-08-18 17:41:42'),
(96, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130057', 1, '4771830', '2025-08-18 17:41:42'),
(97, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140316', 1, '4771830', '2025-08-18 17:41:42'),
(98, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993140162', 1, '4771830', '2025-08-18 17:41:42'),
(99, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127967140604', 1, '4771830', '2025-08-18 17:41:42'),
(100, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127956120328', 1, '4771830', '2025-08-18 17:41:42'),
(101, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120831', 1, '4771830', '2025-08-18 17:41:42'),
(102, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '132287150182', 1, '4771830', '2025-08-18 17:41:42'),
(103, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140607', 1, '4771830', '2025-08-18 17:41:42'),
(104, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126577140110', 1, '4771830', '2025-08-18 17:41:42'),
(105, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955080148', 1, '4771830', '2025-08-18 17:41:43'),
(106, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405155150193', 1, '4771830', '2025-08-18 17:41:43'),
(107, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140743', 1, '4771830', '2025-08-18 17:41:43'),
(108, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140398', 1, '4771830', '2025-08-18 17:41:43'),
(109, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140980', 1, '4771830', '2025-08-18 17:41:43'),
(110, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131632140039', 1, '4771830', '2025-08-18 17:41:43'),
(111, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941130349', 1, '4771830', '2025-08-18 17:41:43'),
(112, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127867140141', 1, '4771830', '2025-08-18 17:41:43'),
(113, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127956140332', 1, '4771830', '2025-08-18 17:41:43'),
(114, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141346', 1, '4771830', '2025-08-18 17:41:43'),
(115, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140331', 1, '4771830', '2025-08-18 17:41:43'),
(116, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127966120298', 1, '4771830', '2025-08-18 17:41:43'),
(117, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140475', 1, '4771830', '2025-08-18 17:41:43'),
(118, NULL, '33333333', 2, '4771830', '2025-08-18 17:45:02'),
(119, 'SF10 - Patty - grade 12 (1).xlsx', '33333333', 1, '4771830', '2025-08-20 16:06:01');

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
('117851130016', 'STEPHEN', 'CABALLERO', 'JOHNSON', NULL, '$2y$10$4qm/dEocyUwNHb6rGTJFd.F5Jy4.M/kqWnUXVbds9BkyhEjFbW/de', 4, '117851130016', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('126577140110', 'JELYN', 'ORONG', 'GUINLAMON', NULL, '$2y$10$7dUDSyIcFIbQDatrOUiXZO4innunzEmkLA1NCIia/NHmfpjgPdt3u', 4, '126577140110', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('126917140008', 'JHANSSEN', 'DEMETERIO', 'GONZALES', NULL, '$2y$10$HHzfiJwDF6ABcPuy05fll.wyohUcEb02po4k5L5t/1cNpZvbe6DGS', 4, '126917140008', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127739130002', 'ZACHARY', 'JOFER MONTEJO', 'JUELE', NULL, '$2y$10$rOpFC2.vDzfKoLSTw6JDneQL2R.RDKWJl01raV.GhJRtDQVQjFfwS', 4, '127739130002', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127867140141', 'PRINCESS', 'NICOLE UNABIA', 'SARANGA', NULL, '$2y$10$fB.ru9gZhWbuYFGJJzBc6u34OhiHYW8.oe3cmS1eSDyv49noZjAW.', 4, '127867140141', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127940120016', 'JHON', 'ELMER CAILING', 'BALDONADE', NULL, '$2y$10$B.07DYVYABB6ugr1RnGchu9I24Cip0dichyOjwIdKQr1xW/7z5yGq', 4, '127940120016', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127940120831', 'AVA', 'KRISTA MARCELINO', 'CABAYACRUZ', NULL, '$2y$10$Chc9Dfi./spVX9iQ4/zbTe0cIfgzJI0spUKyTk75RGpPaKEApdmpi', 4, '127940120831', 1, '0000-00-00', 19, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127940140193', 'LOUISE', 'MIGUEL SUMAMPONG', 'KUIZON', NULL, '$2y$10$TfaRlZEPohoaVUEDw6Q8n.moRG0z0H.Eg/o7dX3J2pOyJrtvIyel2', 4, '127940140193', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127940140219', 'ALJADE', 'METODA', 'CABAÑEROS', NULL, '$2y$10$UXmWFKiU78.GOc.zlqJRm.Y5Tn/oSN66kZYlSH6z0yq5GelBBquMK', 4, '127940140219', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127940140437', 'JOEL', 'CUTANDA', 'AMPER', NULL, '$2y$10$CMDdh1rehYCRk1OZ5Gy06OJNUhNTVALT7EkIHE9n9uR8wWjD3Fdlq', 4, '127940140437', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127940140743', 'JENNIFER', 'GONZAGA', 'OCLARIT', NULL, '$2y$10$4hleokzIhq0T3sjdikT9kuJ7l/PDg66ZDtk3su2Drp1nB1B2UrPFW', 4, '127940140743', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127940140983', 'SANTINO', 'RHYNE CAW-IT', 'LONGGAKIT', NULL, '$2y$10$7Fus7R7bNnECzztuz3tUTOpRXooqPF4cSfv.Aw0TQJTWVO4jLUMey', 4, '127940140983', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127940141023', 'HUNLEY', 'GEMILLA', 'PADIÑO', NULL, '$2y$10$KrnnU4b1cGeKToJ/fu/KrOhJtyzuJT4njnV9IVDMlPRSxTo.1pwF6', 4, '127940141023', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127941130349', 'RAYSHELLE', 'SALARDA', 'REALISTA', NULL, '$2y$10$UGLmBmLZbFGs4kx/hrIi.uqquOv2gezd438paMLd.kU3DpXSnf5.G', 4, '127941130349', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127941140331', 'JUSTINE', 'MAE MENDOZA', 'YANO', NULL, '$2y$10$/mZ3k0kFOu.hwFtJbNQUPO4YtsTS/hqTXFKOCNlbluH8/wGZO3fY.', 4, '127941140331', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127941140398', 'LEXXY', 'REALISTA', 'PAHUNANG', NULL, '$2y$10$RmBjvf66vc4laBX9tNipOOcusVCVIyhMEfe2icM9Ay/gr6plhzoYq', 4, '127941140398', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127941140475', 'SHERRY', 'DELA CRUZ', 'YOUNG', NULL, '$2y$10$naq5dF8GWFEudeWDNBhPeeQOsy.eI4bQ1idkOqYyRrg2O/gccaF06', 4, '127941140475', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127942140607', 'JESSA', 'LASTIMOSO', 'GENTAPA', NULL, '$2y$10$uq8KOyxNBelTC7ZA4NMRgebImJjteDnU.d0t0cOReu30rK5OfaSku', 4, '127942140607', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127955080148', 'NASIFAH', 'BATUA', 'H SAID', NULL, '$2y$10$.pAOtHRmKrI4vZcFRbKrL.Ryaz430PODwmycHMJvvfExMOGqHYqSa', 4, '127955080148', 1, '0000-00-00', 25, 'Islam', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127955130057', 'KRAM', 'EMPIALES', 'SALAS', NULL, '$2y$10$5KIyE.RKf4lADyE.8PjNRupt70m6sxID0N0Yd4mQ3cmqwkKf1Oqwa', 4, '127955130057', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127955130399', 'RICKMERS', 'BASLI-AN', 'MINISTER', NULL, '$2y$10$IWCMhyN0h7siLBEyeYL9Aew38Pv19qDvxrbfcjizZ1y9RF7.DwOhK', 4, '127955130399', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127955160159', 'JEAMWHELL', 'DINOPOL', 'GENERALAO', NULL, '$2y$10$mqUXLHXUyGtpp870B9X7G.Unso9eTGg/gDQd8OaXBd/NMRkjeNx3.', 4, '127955160159', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127956120328', 'MARICEL', '-', 'CABACTULAN', NULL, '$2y$10$DStFL7OeUU1VrxaGfUKlauD7gB0lC63cEtTQw6zyh5k5gFTxpuVF.', 4, '127956120328', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127956140332', 'SAMANTHA', 'ABECIA', 'TIBURON', NULL, '$2y$10$VaK2jPv0zt3dcBmvr8T1l.H9BXOQ1Vkl78SGDGgUivpf6/kqnrvbK', 4, '127956140332', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127964120138', 'ULYAR', 'DAIRO', 'ALFANTE', NULL, '$2y$10$c62Vwi8BZ3BP.z18PQBJluPZuo4Bp2cxfp6uYvzRUi5tYv8NrxiGe', 4, '127964120138', 1, '0000-00-00', 19, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127966120298', 'RAMELLA', 'BONCALES', 'YORDAN', NULL, '$2y$10$Phv.Ok1mCCVQ4RTL46T.lOx/qjEWV9Cg4CgLl3eETRASZVwytMTq6', 4, '127966120298', 1, '0000-00-00', 18, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127967140004', 'KING', 'CHANDLER MENDEZ', 'GENTILES', NULL, '$2y$10$8AQQFyWY.JXdAX5NnTgqdOnTGVdKiOZ1zBEllXOGd0/icaPGajRg6', 4, '127967140004', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127967140604', 'ALFRED', 'ANTIPAS', 'YAP', NULL, '$2y$10$6peAfUFyWSCLQdHPRjO77eTqjKL/0tsnCfyFTSVWxW.SVG70CvDBq', 4, '127967140604', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127992130267', 'WIN', 'RAPIRAP', 'GO', NULL, '$2y$10$RkGMmHvTtIPZiLVGL8UkE.DHpM5m8qk1zfCxaSCvACZm/p3TGvVXq', 4, '127992130267', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127993140162', 'JETRRY', 'GABUT', 'SIBOC', NULL, '$2y$10$eh/o2AJZXml8kgULLs6J1ONYsECfjLjSyMjuN/uD5uwC3T5frDoWG', 4, '127993140162', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127993150140', 'JOHN', 'VINCENT -', 'ESPADILLA', NULL, '$2y$10$K//FjIu8t/i1h/KkKBnbfeNe9T9YvzTwfUJJ0ERd8owHYlfuMiv0K', 4, '127993150140', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127995140316', 'RANDY', 'JR CUICO', 'SALVADOR', NULL, '$2y$10$g5MiO3GTVtZSnGWIFcueAemXcKkCJpz2aQaoP6lgnopODJYfsrzqu', 4, '127995140316', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('127995140395', 'MARK', 'SEBASTIAN GALOPE', 'FABRIA', NULL, '$2y$10$4y8ChyrdpL4szptW8FU3qOmKaP27Sx1ahR6dFWtEfaeidDtXMZp5u', 4, '127995140395', 1, '0000-00-00', 19, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('127995140980', 'ELLYZA', 'YASOL', 'PILO', NULL, '$2y$10$6RB17KChwcQ5Vfb29Fkx.uJHIRZsfC6Asb1NXDlOpLBoUkKkPL1Ky', 4, '127995140980', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('127995141346', 'PRINCESS', 'ALTHEA NADELA', 'YAMUT', NULL, '$2y$10$9W3ApavYsKaop/L4qNN5UOnUa3y1qqoFCO0gxGMMHuVaVo2fOnroW', 4, '127995141346', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('128164140135', 'JABEZ', 'YORONG', 'ACAPULCO', NULL, '$2y$10$jduSHcUrxFIIWccdrMiEluWls.USbNzkfWh4pnwbS4oKfX5MgRnCC', 4, '128164140135', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:40', '2025-08-18 09:41:40'),
('131632140039', 'JOELIE', 'MARIE MARIQUIT', 'RABAGO', NULL, '$2y$10$4UBqzDsKu370tdA1Pyfr4OECl7Qne0jZNQSEi6Zlsx4xZwbaPZiDq', 4, '131632140039', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('132287150182', 'DANICE', 'ROSS XENIA ESTRELLA', 'GALVAN', NULL, '$2y$10$5eN9GiMsKkoPUexVUmhek.BgbUzHS.ePO/Y6kSAXgIXsKtTwpEcNO', 4, '132287150182', 1, '0000-00-00', 16, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('133218140022', 'JAPAR', 'DIBA', 'DAUD', NULL, '$2y$10$FkRKjUQwoQwZFCkynrZ7V.g2bMOV30sojb5cQthNC4JNsc8JNL1m6', 4, '133218140022', 1, '0000-00-00', 16, 'Islam', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('136913130093', 'HERMINE', 'GUMBAY', 'DIMASINSIL', NULL, '$2y$10$/07da.3sM1/g3w7hvaj8NuhHmuUMpeJ/4fO7eQa7Hgj5jPEWfjaPu', 4, '136913130093', 1, '0000-00-00', 17, 'Islam', '', '', '', '', '', 3, 4, '2025-08-18 09:41:41', '2025-08-18 09:41:41'),
('201511140006', 'CARL', 'KESTER LIGUTOM', 'PELIGRO', NULL, '$2y$10$eK2mSp8lthntx/rJbSeeWO61IKWjV9ZcJcG/dvI3UfdZYdkBuBV7O', 4, '201511140006', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('22-2222-2222', 'Mary', '', 'Canonce', 'rape.gallegos.coc@phinmaed.com', '$2y$10$1NWwcwH/L8sWlNQvMqyuquNXriD9HlsvB8V3bgt8tzjb6N4vEZmdm', 4, '22-2222-2222', 1, '2002-02-22', 22, 'Roman Catholic', 'Iponan', '', '', '', '', 3, 4, '2025-08-06 09:48:41', '2025-08-17 13:45:54'),
('33333333', 'Patricia', '', 'Aspirass', 'ralphjanpelino@gmail.com', '$2y$10$bkhlAH8VfrdRfB9Kuu6HverJ2jFJ83a8wCrn9DIiJ0.SFlxvT5u.q', 4, '33333333', 4, '2003-02-21', 20, 'Roman Catholic', 'Iponan', 'ralph jan gallegos', '', '', '', 3, 4, '2025-08-06 12:42:47', '2025-08-20 08:33:49'),
('405155150193', 'MARICEL', 'SIBOLON', 'MANOS', NULL, '$2y$10$Wab90Xy9DL7kyPbuZfUAce4UQimCB/ORqycIqIQfdjDMn2wyMOsfS', 4, '405155150193', 1, '0000-00-00', 15, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:43', '2025-08-18 09:41:43'),
('405241150066', 'ARJAY', 'PALMARES', 'REYES', NULL, '$2y$10$qfJEZy5SiocnAUKODq7dyul4Pgso4mH9Wxy2JGHdkhN1BZrr4T4N.', 4, '405241150066', 1, '0000-00-00', 17, 'Christianity', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
('510062400004', 'JOHAYVER', 'CALIPAPA', 'MAKI', NULL, '$2y$10$fWcevjrE.UYPPcPo4eLQPeX/okSHJbeRZ/SdwogxYsloIniE1iQAG', 4, '510062400004', 1, '0000-00-00', 18, 'Islam', '', '', '', '', '', 3, 4, '2025-08-18 09:41:42', '2025-08-18 09:41:42'),
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
(13, '22-2222-2222', 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-CANONCEsample.pdf', 5, 1, '4771830', '2025-08-17 22:01:21'),
(14, '33333333', 'SF10 - Patty22.pdf', 5, 1, '4771830', '2025-08-20 16:06:01');

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
-- Indexes for table `tbldocumentrequirement`
--
ALTER TABLE `tbldocumentrequirement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `requirementTId` (`requirementTId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblforgotlrn`
--
ALTER TABLE `tblforgotlrn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `processed_by` (`processed_by`);

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
-- AUTO_INCREMENT for table `tbldocumentrequirement`
--
ALTER TABLE `tbldocumentrequirement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tblforgotlrn`
--
ALTER TABLE `tblforgotlrn`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblrequest`
--
ALTER TABLE `tblrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
-- Constraints for table `tbldocumentrequirement`
--
ALTER TABLE `tbldocumentrequirement`
  ADD CONSTRAINT `tbldocumentrequirement_ibfk_1` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tbldocumentrequirement_ibfk_2` FOREIGN KEY (`requirementTId`) REFERENCES `tblrequirementstype` (`id`),
  ADD CONSTRAINT `tbldocumentrequirement_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblforgotlrn`
--
ALTER TABLE `tblforgotlrn`
  ADD CONSTRAINT `tblforgotlrn_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `tbluser` (`id`);

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
