-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2025 at 03:19 AM
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

--
-- Dumping data for table `tblrequest`
--

INSERT INTO `tblrequest` (`id`, `studentId`, `documentId`, `purpose`, `createdAt`) VALUES
(1, '107129140272', 5, 'shesh', '2025-08-05 08:52:58');

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
(1, 1, 1, NULL, '2025-08-05 08:52:58');

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
  `fileName` varchar(100) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `gradeLevelId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsfrecord`
--

INSERT INTO `tblsfrecord` (`id`, `fileName`, `studentId`, `gradeLevelId`, `userId`, `createdAt`) VALUES
(1, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-ABRIO.xlsx', '127947120341', 1, '02-1819-01500', '2025-07-30 23:33:08'),
(2, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127990140188', 1, '02-1819-01500', '2025-07-30 23:33:08'),
(3, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120005', 1, '02-1819-01500', '2025-07-30 23:33:08'),
(4, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '125615140024', 1, '02-1819-01500', '2025-07-30 23:33:08'),
(5, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958130112', 1, '02-1819-01500', '2025-07-30 23:33:08'),
(6, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127905140043', 1, '02-1819-01500', '2025-07-30 23:33:08'),
(7, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127772140006', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(8, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127961140304', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(9, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140061', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(10, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '510062300284', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(11, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140522', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(12, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127959140153', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(13, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-ADLAON.xlsx', '132895140021', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(14, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140425', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(15, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964120671', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(16, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '119871150147', 1, '02-1819-01500', '2025-07-30 23:33:09'),
(17, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128529140027', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(18, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140019', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(19, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126332140046', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(20, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128003140174', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(21, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128038140110', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(22, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127959140297', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(23, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '130621140035', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(24, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940141142', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(25, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140968', 1, '02-1819-01500', '2025-07-30 23:33:10'),
(26, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944130830', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(27, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140242', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(28, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140102', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(29, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127992140153', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(30, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141190', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(31, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140816', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(32, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150642', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(33, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '133693150003', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(34, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962140234', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(35, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942100719', 1, '02-1819-01500', '2025-07-30 23:33:11'),
(36, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127994140114', 1, '02-1819-01500', '2025-07-30 23:33:12'),
(37, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140603', 1, '02-1819-01500', '2025-08-01 08:29:06'),
(38, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127971140003', 1, '02-1819-01500', '2025-08-01 08:29:06'),
(39, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131602100046', 1, '02-1819-01500', '2025-08-01 08:29:06'),
(40, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962130140', 1, '02-1819-01500', '2025-08-01 08:29:06'),
(41, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '107129140272', 1, '02-1819-01500', '2025-08-01 08:29:07'),
(42, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127988140015', 1, '02-1819-01500', '2025-08-01 08:29:07'),
(43, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942120942', 1, '02-1819-01500', '2025-08-01 08:29:07'),
(44, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127999140410', 1, '02-1819-01500', '2025-08-01 08:29:07'),
(45, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140482', 1, '02-1819-01500', '2025-08-01 08:29:07'),
(46, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941100355', 1, '02-1819-01500', '2025-08-01 08:29:07'),
(47, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128003120088', 1, '02-1819-01500', '2025-08-01 08:29:08'),
(48, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405208150289', 1, '02-1819-01500', '2025-08-01 08:29:08'),
(49, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126659140013', 1, '02-1819-01500', '2025-08-01 08:29:08'),
(50, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964130797', 1, '02-1819-01500', '2025-08-01 08:29:08'),
(51, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140802', 1, '02-1819-01500', '2025-08-01 08:29:08'),
(52, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140168', 1, '02-1819-01500', '2025-08-01 08:29:09'),
(53, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958130065', 1, '02-1819-01500', '2025-08-01 08:29:09'),
(54, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130123', 1, '02-1819-01500', '2025-08-01 08:29:09'),
(55, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993140295', 1, '02-1819-01500', '2025-08-01 08:29:09'),
(56, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record-ADANZA.xlsx', '127940140661', 1, '02-1819-01500', '2025-08-01 08:29:09'),
(57, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150450', 1, '02-1819-01500', '2025-08-01 08:29:10'),
(58, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120074', 1, '02-1819-01500', '2025-08-01 08:29:10'),
(59, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140124', 1, '02-1819-01500', '2025-08-01 08:29:10'),
(60, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964140289', 1, '02-1819-01500', '2025-08-01 08:29:10'),
(61, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131349140035', 1, '02-1819-01500', '2025-08-01 08:29:10'),
(62, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940110239', 1, '02-1819-01500', '2025-08-01 08:29:10'),
(63, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140108', 1, '02-1819-01500', '2025-08-01 08:29:11'),
(64, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120991', 1, '02-1819-01500', '2025-08-01 08:29:11'),
(65, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126950130024', 1, '02-1819-01500', '2025-08-01 08:29:11'),
(66, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993120374', 1, '02-1819-01500', '2025-08-01 08:29:11'),
(67, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126327110134', 1, '02-1819-01500', '2025-08-01 08:29:11'),
(68, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140653', 1, '02-1819-01500', '2025-08-01 08:29:12'),
(69, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140700', 1, '02-1819-01500', '2025-08-01 08:29:12'),
(70, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140875', 1, '02-1819-01500', '2025-08-01 08:29:12'),
(71, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964140245', 1, '02-1819-01500', '2025-08-01 08:29:12'),
(72, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140603', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(73, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127971140003', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(74, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131602100046', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(75, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962130140', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(76, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '107129140272', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(77, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127988140015', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(78, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942120942', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(79, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127999140410', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(80, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140482', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(81, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941100355', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(82, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128003120088', 1, '02-1819-01500', '2025-08-04 22:09:51'),
(83, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405208150289', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(84, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126659140013', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(85, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964130797', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(86, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140802', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(87, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140168', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(88, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958130065', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(89, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130123', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(90, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993140295', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(91, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140661', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(92, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150450', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(93, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120074', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(94, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140124', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(95, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964140289', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(96, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131349140035', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(97, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940110239', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(98, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140108', 1, '02-1819-01500', '2025-08-04 22:09:52'),
(99, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120991', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(100, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126950130024', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(101, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993120374', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(102, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126327110134', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(103, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140653', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(104, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140700', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(105, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140875', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(106, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964140245', 1, '02-1819-01500', '2025-08-04 22:09:53'),
(107, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995130887', 1, '02-1819-01500', '2025-08-05 09:04:50'),
(108, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140395', 1, '02-1819-01500', '2025-08-05 09:04:50'),
(109, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130297', 1, '02-1819-01500', '2025-08-05 09:04:50'),
(110, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140258', 1, '02-1819-01500', '2025-08-05 09:04:51'),
(111, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127957140185', 1, '02-1819-01500', '2025-08-05 09:04:51'),
(112, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940141288', 1, '02-1819-01500', '2025-08-05 09:04:51'),
(113, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131662140006', 1, '02-1819-01500', '2025-08-05 09:04:51'),
(114, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140614', 1, '02-1819-01500', '2025-08-05 09:04:51'),
(115, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '132601150002', 1, '02-1819-01500', '2025-08-05 09:04:51'),
(116, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140510', 1, '02-1819-01500', '2025-08-05 09:04:52'),
(117, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '119453140027', 1, '02-1819-01500', '2025-08-05 09:04:52'),
(118, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140444', 1, '02-1819-01500', '2025-08-05 09:04:52'),
(119, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131260120551', 1, '02-1819-01500', '2025-08-05 09:04:52'),
(120, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140077', 1, '02-1819-01500', '2025-08-05 09:04:52'),
(121, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127842140143', 1, '02-1819-01500', '2025-08-05 09:04:53'),
(122, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405176150009', 1, '02-1819-01500', '2025-08-05 09:04:53'),
(123, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127620110113', 1, '02-1819-01500', '2025-08-05 09:04:53'),
(124, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '133527150140', 1, '02-1819-01500', '2025-08-05 09:04:53'),
(125, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127963130086', 1, '02-1819-01500', '2025-08-05 09:04:53'),
(126, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150223', 1, '02-1819-01500', '2025-08-05 09:04:53'),
(127, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126277140066', 1, '02-1819-01500', '2025-08-05 09:04:54'),
(128, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126462140017', 1, '02-1819-01500', '2025-08-05 09:04:54'),
(129, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962140118', 1, '02-1819-01500', '2025-08-05 09:04:54'),
(130, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962140294', 1, '02-1819-01500', '2025-08-05 09:04:54'),
(131, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140138', 1, '02-1819-01500', '2025-08-05 09:04:54'),
(132, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140528', 1, '02-1819-01500', '2025-08-05 09:04:55'),
(133, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141261', 1, '02-1819-01500', '2025-08-05 09:04:55'),
(134, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127591140053', 1, '02-1819-01500', '2025-08-05 09:04:55'),
(135, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140436', 1, '02-1819-01500', '2025-08-05 09:04:55'),
(136, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140100', 1, '02-1819-01500', '2025-08-05 09:04:55'),
(137, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140472', 1, '02-1819-01500', '2025-08-05 09:04:55'),
(138, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140683', 1, '02-1819-01500', '2025-08-05 09:04:56'),
(139, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126340130018', 1, '02-1819-01500', '2025-08-05 09:04:56'),
(140, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150614', 1, '02-1819-01500', '2025-08-05 09:04:56'),
(141, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140083', 1, '02-1819-01500', '2025-08-05 09:04:56'),
(142, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141402', 1, '02-1819-01500', '2025-08-05 09:04:56'),
(143, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140020', 1, '02-1819-01500', '2025-08-05 09:04:57'),
(144, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126905140061', 1, '02-1819-01500', '2025-08-05 09:04:57');

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
  `track` varchar(255) DEFAULT NULL,
  `strand` varchar(255) DEFAULT NULL,
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

--
-- Dumping data for table `tblstudent`
--

INSERT INTO `tblstudent` (`id`, `firstname`, `middlename`, `lastname`, `email`, `password`, `userLevel`, `lrn`, `track`, `strand`, `section`, `birthDate`, `age`, `religion`, `completeAddress`, `fatherName`, `motherName`, `guardianName`, `guardianRelationship`, `sectionId`, `schoolyearId`, `createdAt`, `updatedAt`) VALUES
('107129140272', 'MARK', 'RV PARADERO', 'GUEVARRA', 'mark.guevarra@student.mogchs.edu.ph', '$2y$10$nU4rIIBqf/yNUyyHDFEXneLWCU3E4moeBVytDl8JoUY.ILTg.6kWe', 4, '107129140272', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('119453140027', 'MARTIN', 'NICOLE TAYO', 'HABONITA', 'martin.habonita@student.mogchs.edu.ph', '$2y$10$L4bvqiyDv249AsOMQSjjWuSxkpuGcgN1giIQF0ycrUMcRXfbHgMum', 4, '119453140027', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:52', '2025-08-05 01:04:52'),
('126277140066', 'CHELLIE', 'ASHLY AMANTE', 'BADBAD', 'chellie.badbad@student.mogchs.edu.ph', '$2y$10$aUfnlRisqAtZA9xzmoDl.ej4F12lj4Wone85zSIAfpZnYp0OdZgEG', 4, '126277140066', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:54', '2025-08-05 01:04:54'),
('126327110134', 'SHABY', 'REFULLE', 'SADICON', 'shaby.sadicon@student.mogchs.edu.ph', '$2y$10$N9Rkp1aBOSqKUzgtiM5AYehP9btmainZBLf/PSktP1lX5MawMAWAy', 4, '126327110134', '', '', '', '0000-00-00', 19, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('126340130018', 'KIRBY', 'KATE NEPOMUCINO', 'REPUELA', 'kirby.repuela@student.mogchs.edu.ph', '$2y$10$YCarlkvS/CzfrlOqa8oDf.s.jRf34kE3/n2eGgGydUwXlbfanxYI2', 4, '126340130018', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:56', '2025-08-05 01:04:56'),
('126462140017', 'DONNA', 'FATE PAÑA', 'BAGUHIN', 'donna.baguhin@student.mogchs.edu.ph', '$2y$10$BQQqYjKEJUqlZ2tUAoPxNe175tpc/DYJeFmbB5ShaIhuUfe0jfn8a', 4, '126462140017', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:54', '2025-08-05 01:04:54'),
('126659140013', 'JUNNEL', 'JR ASARES', 'PELAEZ', 'junnel.pelaez@student.mogchs.edu.ph', '$2y$10$GGFtcdfzoWZMp4io9HPbc.nvrN4Yd5FF6fjYqPHpvjgNjuFqzZqa.', 4, '126659140013', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('126905140061', 'RICHYLEN', 'FABIAÑA', 'TARDE', 'richylen.tarde@student.mogchs.edu.ph', '$2y$10$5o7WGRprLLyKU69At9ZE2.7q9egdAaxAb9u2vxGnWrULYqExcFK82', 4, '126905140061', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:57', '2025-08-05 01:04:57'),
('126950130024', 'ANIA', 'SINAL', 'MACAORAO', 'ania.macaorao@student.mogchs.edu.ph', '$2y$10$YK4gcGNGSKiP6TtnzcBoteY7KYqi6Fpvk2VD89Pk5IU24rtzkN68y', 4, '126950130024', '', '', '', '0000-00-00', 16, 'Islam', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127591140053', 'JASSEL', 'QUITOS', 'HINDOY', 'jassel.hindoy@student.mogchs.edu.ph', '$2y$10$/pzB0xwhznQlQA1iDt7upuEhwuGzRTzgpzXzkMKG83jYRYJgdP3he', 4, '127591140053', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:55', '2025-08-05 01:04:55'),
('127620110113', 'JADE', 'ETOR', 'PETALCORIN', 'jade.petalcorin@student.mogchs.edu.ph', '$2y$10$CEgJEm2eXXcp43.2TO8NJe8AO4wTPG8nYFP/attrblSYB1Z2DbjdW', 4, '127620110113', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:53', '2025-08-05 01:04:53'),
('127842140143', 'LEXTER', 'ANDO', 'OYAO', 'lexter.oyao@student.mogchs.edu.ph', '$2y$10$F7epdIBA.scrr9l15luqbOW1zRcw6YmeXIJU8tuUeWavVPLSLj7dK', 4, '127842140143', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:53', '2025-08-05 01:04:53'),
('127940110239', 'NATALIE', 'KRISTY GALAMITON', 'GARCIA', 'natalie.garcia@student.mogchs.edu.ph', '$2y$10$zfoQhmcq2yuuk2gSUzGxheo/er2qcVYR/J9uoxahvstOx.hmhOrDK', 4, '127940110239', '', '', '', '0000-00-00', 19, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127940120074', 'KRYSTAL', 'MAE CABALES', 'BALDON', 'krystal.baldon@student.mogchs.edu.ph', '$2y$10$gcIWLuHRDTyRlpL8Y9NU7euN.fFOaSUyqYfXpl.qmh0FTkGX9njli', 4, '127940120074', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127940120991', 'NOVA', 'FEI CESAR', 'LUMBA', 'nova.lumba@student.mogchs.edu.ph', '$2y$10$qQo/oopwn/vPmTqa1D.3IeoObLnCqpye9gTjfzBuJmyeH9M9uPdMq', 4, '127940120991', '', '', '', '0000-00-00', 19, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127940140258', 'DIONESIO', 'JR EMBALZADO', 'BALIGA', 'dionesio.baliga@student.mogchs.edu.ph', '$2y$10$W33o3J4HhKA6DmYvmGzgLOBMeeoYnQ.bj7o3VQS59lbKycLqJhxvC', 4, '127940140258', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:51', '2025-08-05 01:04:51'),
('127940140472', 'SOPHIA', 'YVONNE BARON', 'MINISTER', 'sophia.minister@student.mogchs.edu.ph', '$2y$10$xo2NZCUmmMA7t9v/ZJqT9Ow8d0s.53p32mh9ZTcKvNr.CbZ84ead6', 4, '127940140472', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:55', '2025-08-05 01:04:55'),
('127940140510', 'JOHN', 'LOYD PEPITO', 'GUZMANA', 'john.guzmana@student.mogchs.edu.ph', '$2y$10$uI5HNrjB0cV6s85IqD3aaOlZ8uI.DKsU0FuMGiMDi6lje8wgWTJyO', 4, '127940140510', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:52', '2025-08-05 01:04:52'),
('127940140528', 'ZANDRA', 'ROLLON', 'DIZON', 'zandra.dizon@student.mogchs.edu.ph', '$2y$10$C8Jj3uZ3khVAN2ZR95BwV.AFpvCLPHiKZRS1OSRT2xnQm9r1JHyMC', 4, '127940140528', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:55', '2025-08-05 01:04:55'),
('127940140661', 'IVAN', 'CLAIRE -', 'ADANZA', 'ivan.adanza@student.mogchs.edu.ph', '$2y$10$7jBpmrZxMjhzcBHZ6bZtuOwuDqI7AWgy3pphk5.8Sz6kNNXhWyJ0q', 4, '127940140661', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127940140683', 'ELLAJOY', 'LOPEZ', 'NAPONE', 'ellajoy.napone@student.mogchs.edu.ph', '$2y$10$93twSsD/qbDWoGaby7FEKuZIXL9r8w3TTDHj6Dp3ru.jRdb9Dj8o.', 4, '127940140683', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:56', '2025-08-05 01:04:56'),
('127940141288', 'ARVIN', 'JHON RECIPIDA', 'CASTILLO', 'arvin.castillo@student.mogchs.edu.ph', '$2y$10$BDgqUpyHiNu8bTOXI3qwDeSyTFgrFFzEOi9WsYIRvNT4hAHDkRV.e', 4, '127940141288', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:51', '2025-08-05 01:04:51'),
('127940150223', 'PRINCESS', 'APPLE AMANTE', 'ABRAGAN', 'princess.abragan@student.mogchs.edu.ph', '$2y$10$cHsNoAkVRcfkyU0lj6q8b.1cBhATbqWHU1KYMcLFmnmOcLqOWh6ee', 4, '127940150223', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:53', '2025-08-05 01:04:53'),
('127940150450', 'MAILEEN', 'MHAE CASANOVA', 'BAGANES', 'maileen.baganes@student.mogchs.edu.ph', '$2y$10$trOk9.kIG1VcnqixRcTK1uDxaeflQpf/ItkX7hN/6NEhIiTx8RA1C', 4, '127940150450', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127940150614', 'LEAH', 'GARCIA', 'SALINGAY', 'leah.salingay@student.mogchs.edu.ph', '$2y$10$hTk3AR73jGa4HCzydtiddeppDfSnFGgbrFd6mICmyW40./MfofSSi', 4, '127940150614', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:56', '2025-08-05 01:04:56'),
('127941100355', 'JAY', 'MARK ABATAYO', 'PACQUIAO', 'jay.pacquiao@student.mogchs.edu.ph', '$2y$10$rP0eAug5OvIaHkHFT7yEauby2hfEuCMIn5Rzh.iNs5mIhazgmdZse', 4, '127941100355', '', '', '', '0000-00-00', 20, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127941140436', 'XYPRESS', 'ANGELA ESPITAL', 'JABINIAO', 'xypress.jabiniao@student.mogchs.edu.ph', '$2y$10$ucWDbzdvjYyASJzZTfmzw.tLkSQckM0lihW7RUnwgC9ewe8nM0XmK', 4, '127941140436', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:55', '2025-08-05 01:04:55'),
('127942120942', 'JAMES', 'TROY TABUNO', 'JORILLA', 'james.jorilla@student.mogchs.edu.ph', '$2y$10$KeGhyJAphzei8pqcvY9KQ.HnXOqK6cYSuIefPSzVrWPE.IWjuCW1i', 4, '127942120942', '', '', '', '0000-00-00', 21, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127942140395', 'ANDY', 'MIKE BONGCARON', 'ALGA', 'andy.alga@student.mogchs.edu.ph', '$2y$10$MqiuKux1e9zyKF3wqIw7ZO6w20oMC9gXWJeeXy4pUqxnFHCc/hhuy', 4, '127942140395', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:50', '2025-08-05 01:04:50'),
('127942140603', 'CHRISTIAN', 'ANGGOT', 'ATES', 'christian.ates@student.mogchs.edu.ph', '$2y$10$bb3Bw7JnsOix5ZdOhzDPj.lY2LBePNvkhYzYz1tecmG9VUn6y4YYS', 4, '127942140603', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127942140653', 'LJ', 'DARYN -', 'TARIAO', 'lj.tariao@student.mogchs.edu.ph', '$2y$10$wuNi.eqNjuwfMJa2XPvIieY/0jfulVEsJa9UibX4QvWOD2FpjTHby', 4, '127942140653', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127944140444', 'CLEVIN', 'MAR TABACO', 'JENISAN', 'clevin.jenisan@student.mogchs.edu.ph', '$2y$10$lHHDgEhjQiSlXpdb0vAreuFruCf5A/rchL6owpLAv3WcSW3E6KixC', 4, '127944140444', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:52', '2025-08-05 01:04:52'),
('127944140482', 'J.', 'RUPERT MARCAIDA', 'MATEO', 'j..mateo@student.mogchs.edu.ph', '$2y$10$zitKy3uHKGyvO27xwU8Qzu1aRylM9TapsP3uKVZMxhV6H2Z/U5LFS', 4, '127944140482', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127944140614', 'JED', 'KURVEN TIPDAS', 'GERMANO', 'jed.germano@student.mogchs.edu.ph', '$2y$10$vAm6mg7ftLJSrQWmi7kZyOJKPrZbmGYPLujQr9V4qyY4Lf3QtmJhm', 4, '127944140614', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:51', '2025-08-05 01:04:51'),
('127944140700', 'KARYLLE', 'KATE ROMERA', 'UNONG', 'karylle.unong@student.mogchs.edu.ph', '$2y$10$ikNypkL/snmSpnmD4GiFMeNwqMYk1l0n9QiylnIzatiExgveenmUW', 4, '127944140700', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127944140802', 'ERNIE', 'JR DUNGOG', 'QUIÑONEZ', 'ernie.quionez@student.mogchs.edu.ph', '$2y$10$rK12zBrBalMz41qf/IYw.ucL/aZB6ChW0q5iUxn75MYQ3U3/gBivm', 4, '127944140802', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127944140875', 'MAE', 'VIVIEN SUSON', 'WAGAS', 'mae.wagas@student.mogchs.edu.ph', '$2y$10$OlTs7uIieiUuYmq9xVNPsu06gJtBx20pirqdViCrwj.94ao/OrsOu', 4, '127944140875', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127955130123', 'ANTHONY', 'REY BEDUYA', 'TAHA', 'anthony.taha@student.mogchs.edu.ph', '$2y$10$.JXuq/L0Mj2MyxYUM0pAUOMjcXc72VCRbPjsvTh1ZmIgO9fiwnPCq', 4, '127955130123', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127955130297', 'ASLANIE', 'ABANTAS', 'ANSARY', 'aslanie.ansary@student.mogchs.edu.ph', '$2y$10$hmkSU.E3kuLQFx2bC9KkP.CFwCdWyP/X.m502AWtSb5h2c98v6DcG', 4, '127955130297', '', '', '', '0000-00-00', 17, 'Islam', '', '', '', '', '', 9, 4, '2025-08-05 01:04:50', '2025-08-05 01:04:50'),
('127955140083', 'SHIELA', 'MAE BALABA', 'SALONOY', 'shiela.salonoy@student.mogchs.edu.ph', '$2y$10$pZYgxgefSeFoV4t0eO.7r.hQMmwfowVMcNumYshoKEmEDeALUEWo.', 4, '127955140083', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:56', '2025-08-05 01:04:56'),
('127955140124', 'KISSES', 'NICOLE ESKACINAS', 'CUERDO', 'kisses.cuerdo@student.mogchs.edu.ph', '$2y$10$JihneKFerX8XSjX34iUa.eVXmneqJJwqy3TNq5VzD8YiN3O4Hd3iO', 4, '127955140124', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127955140138', 'STEPHANIE', 'TUA', 'DIZON', 'stephanie.dizon@student.mogchs.edu.ph', '$2y$10$nkCZUvYT8y04mqADh/FGo.m4aCiEx9ly5DEOmgtF68wbdKeiiJmoq', 4, '127955140138', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:54', '2025-08-05 01:04:54'),
('127955140168', 'VERSAMEL', 'DUMALA', 'RIVERA', 'versamel.rivera@student.mogchs.edu.ph', '$2y$10$ivVj4.azixYbTUfVrbJPDelhKcMcdb41p4LnMD4z3ZwJcR9DotIBa', 4, '127955140168', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127957140185', 'RONALD', 'CELIS', 'CAIÑA', 'ronald.caia@student.mogchs.edu.ph', '$2y$10$JEOKpoQoPrFchTVHFcqgTuiiLwqAu3JEfE0tGNph2/cRUC1mq3ns6', 4, '127957140185', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:51', '2025-08-05 01:04:51'),
('127958130065', 'REYMARK', 'ALIPIO', 'SANTOS', 'reymark.santos@student.mogchs.edu.ph', '$2y$10$he4JLim.vsM2Mwi.4wIMEu16/a0Bk//THwPXR3ufKxHkZtGYvuKBm', 4, '127958130065', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127958140020', 'MABELL', 'NAVARRO', 'TANO', 'mabell.tano@student.mogchs.edu.ph', '$2y$10$ozedXULmEIUuVEuHgO6t5eseqJVxLpcG/owEQmbmNxAyMz2xZIeB2', 4, '127958140020', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:57', '2025-08-05 01:04:57'),
('127958140077', 'DAN', 'JOVEN ESPAÑA', 'MINDORO', 'dan.mindoro@student.mogchs.edu.ph', '$2y$10$Nn/X1uop/6RvphwgdJLuouN3Gal63DggOodEktPq0rP/YgJm1eNBq', 4, '127958140077', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:52', '2025-08-05 01:04:52'),
('127958140100', 'DIVINE', 'LANTAO', 'LABADOR', 'divine.labador@student.mogchs.edu.ph', '$2y$10$rxRi2TkuDboplF1Y8Ci1UulafmKFPvxr0p.BfPwsmSvgMloe.f1GW', 4, '127958140100', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:55', '2025-08-05 01:04:55'),
('127958140108', 'ELISHA', 'ANNE BASLIAN', 'JANI', 'elisha.jani@student.mogchs.edu.ph', '$2y$10$8vp.gaVhffSJqSeDx3rGs.ZT4hD/t7qOTXc5gkd5RiLLZXLlVfEQ.', 4, '127958140108', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127962130140', 'LEONARDO', 'TUDLO-AN', 'GUADALQUIEVER', 'leonardo.guadalquiever@student.mogchs.edu.ph', '$2y$10$/wqTgwD8Bq9OgXDZBm9z9.StD7Jdd.HPqEHD8WwEZotW70PIY.F7m', 4, '127962130140', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127962140118', 'JELLANAH', 'CABUGASON', 'DAAMO', 'jellanah.daamo@student.mogchs.edu.ph', '$2y$10$wh1qrugFKj7hFF3r4kGlz.HEG6R2oESw5Uu8WExc7TliDOofrkIN6', 4, '127962140118', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:54', '2025-08-05 01:04:54'),
('127962140294', 'ROCHELLE', 'ALUNGAY', 'DATAHAN', 'rochelle.datahan@student.mogchs.edu.ph', '$2y$10$axCZ8RzpAWg8kZS00TkQZe7qbGR2HvjFRtwbuHM6oA4Fgr7NLDOJ6', 4, '127962140294', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:54', '2025-08-05 01:04:54'),
('127963130086', 'LORIE', 'MAE AMAHOY', 'ABAN', 'lorie.aban@student.mogchs.edu.ph', '$2y$10$ZOEy.vlHibJRXdIeXnB8fONRtLnGXyGkPYi9ZRDsJxFvcR2HLE5Me', 4, '127963130086', '', '', '', '0000-00-00', 17, 'Islam', '', '', '', '', '', 9, 4, '2025-08-05 01:04:53', '2025-08-05 01:04:53'),
('127964130797', 'JAYLOU', 'PARAO', 'PURICALLAN', 'jaylou.puricallan@student.mogchs.edu.ph', '$2y$10$0eUBdLPiATchZ38/92EI5OGMX046fyCl7tGBa8aIAA05A93iEKaFW', 4, '127964130797', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127964140245', 'KATHLYN', 'CAMPANO', 'YBAÑEZ', 'kathlyn.ybaez@student.mogchs.edu.ph', '$2y$10$89V1NHoCJ9HlhuwLHshIL.XHNtnpsdfjw7E1hmbUIzyLrdgfuGWV2', 4, '127964140245', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127964140289', 'NATHALIE', 'FAITH -', 'ECHALICO', 'nathalie.echalico@student.mogchs.edu.ph', '$2y$10$F9XWEbGRGYg.UQ8Hafb..Ok/TRRK2t0Bbtk/mlKadcJWJnpxvIj1y', 4, '127964140289', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127971140003', 'ROYSEY', '-', 'CAIMAHAN', 'roysey.caimahan@student.mogchs.edu.ph', '$2y$10$KR0s3GwRTPDTAe/lKrkiYOfulNv4.gHpcLqR8Ge1i6wtXfVDLHbWe', 4, '127971140003', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127988140015', 'REMARK', 'DALAHAY', 'HIDALGO', 'remark.hidalgo@student.mogchs.edu.ph', '$2y$10$jWyxkxF/Vnz22vw4Fs94re.yqhiNb0kl8hhG5o3ztp4rQ.h4wvyl6', 4, '127988140015', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('127993120374', 'ALEXANDRA', 'QUIDLAT', 'PAJARON', 'alexandra.pajaron@student.mogchs.edu.ph', '$2y$10$3OJ4MPkEchsshK0T72zVO.y43Lv3pm0zae.HTK3MxJh2..XOk.ZXS', 4, '127993120374', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:53', '2025-08-04 14:09:53'),
('127993140295', 'FRANCIS', 'JIMS DABLO', 'TAMPOS', 'francis.tampos@student.mogchs.edu.ph', '$2y$10$r2EtDiNlhDPwBBoMghp24eG1LQKv0jS9mdZciM0Ii31oq/.o1HTEa', 4, '127993140295', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('127995130887', 'JOHN', 'VINCENT JAGUNAP', 'ABARRIENTOS', 'john.abarrientos@student.mogchs.edu.ph', '$2y$10$1p.s0mup1oJCxFMIUMTYTe2Kw5zdu9gG35fbiue4NjA9ahTLCsQhy', 4, '127995130887', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:50', '2025-08-05 01:04:50'),
('127995141261', 'DANICA', 'HAZEL JAIN GALOPE', 'FABRIA', 'danica.fabria@student.mogchs.edu.ph', '$2y$10$JY2vYF.yiCO1DA1HaultkeHJzQ3ly9DSWplKL6b6yb6u5RYrUxWGC', 4, '127995141261', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:55', '2025-08-05 01:04:55'),
('127995141402', 'ZILDJIAN', 'SASUMAN', 'SOLOMON', 'zildjian.solomon@student.mogchs.edu.ph', '$2y$10$56n6AaR0KaOG9PZbyWw78uPBhExzAre/5uK/7BciofFBwlxpp.0ai', 4, '127995141402', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:56', '2025-08-05 01:04:56'),
('127999140410', 'PRINCE', 'STEVEN CANTUTAY', 'LAURON', 'prince.lauron@student.mogchs.edu.ph', '$2y$10$3TfIojJucmOcMFQUFDpwJeRGCuxuHH4ShgWzIS4W1xnq3fS3OprBu', 4, '127999140410', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('128003120088', 'LORENCE', 'NINO LABIAL', 'PADERNA', 'lorence.paderna@student.mogchs.edu.ph', '$2y$10$ud6JuqQMvcypzE9i/ixzjO0JIyRZWu9d10AUf7m5I.5RcsAJ8R.Ja', 4, '128003120088', '', '', '', '0000-00-00', 17, 'Others', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('131260120551', 'RICHARD', 'JR ENTONG', 'MEDIANA', 'richard.mediana@student.mogchs.edu.ph', '$2y$10$3ZYgjXhMzm2EQRx1eXRSgOeYerTHF3kgmArWVd2zZ.2K6oX/1XoAK', 4, '131260120551', '', '', '', '0000-00-00', 17, 'Islam', '', '', '', '', '', 9, 4, '2025-08-05 01:04:52', '2025-08-05 01:04:52'),
('131349140035', 'JOANAH', 'LORRAINE GOLIS', 'ESPIRITU', 'joanah.espiritu@student.mogchs.edu.ph', '$2y$10$R0iVyCIDY52wOyA5FtPuf.gnaJXbQfo7tBmWC8Q7nGGJsZFYNBmVG', 4, '131349140035', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52'),
('131602100046', 'ROWIL', 'JR MONTEMAYOR', 'GAMBA', 'rowil.gamba@student.mogchs.edu.ph', '$2y$10$y0v2xT8TwA1mngLPP7CAl.yozKF1oTtWU9ygXbxi9/e8FQDZ3gBdC', 4, '131602100046', '', '', '', '0000-00-00', 20, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:51', '2025-08-04 14:09:51'),
('131662140006', 'SIM', 'GEB HEART ADLAON', 'CEDEÑO', 'sim.cedeo@student.mogchs.edu.ph', '$2y$10$Bpv6vW3HBByrMsU/xeu.G.NnvM7L3RvVMtJ0sIhPzQ1BUXuY32ZZO', 4, '131662140006', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:51', '2025-08-05 01:04:51'),
('132601150002', 'VON', 'CRIZTOFF CABUGA', 'GUINGGUING', 'von.guingguing@student.mogchs.edu.ph', '$2y$10$0qens/ye4vKLtG0D.YVo9.kfROp0MWoBNX7tERx/iqsS/99AGoI8W', 4, '132601150002', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:51', '2025-08-05 01:04:51'),
('133527150140', 'RYLLE', 'KENT DIZON', 'ZABALA', 'rylle.zabala@student.mogchs.edu.ph', '$2y$10$N38eKj6U8EEYRHqc5Aesl./Oejg5AYw/5UdxS7bStNWSptTBwU5ja', 4, '133527150140', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:53', '2025-08-05 01:04:53'),
('405176150009', 'BRAD', 'LUNA', 'PADERANGA', 'brad.paderanga@student.mogchs.edu.ph', '$2y$10$EY3JJh8bL/mrtjpf4pQTkeyyNPEMOfPDDy5NOSAb5giEiYP5W1vPS', 4, '405176150009', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 9, 4, '2025-08-05 01:04:53', '2025-08-05 01:04:53'),
('405208150289', 'CELSO', 'GABRIEL ZAGADO', 'PARMISANO', 'celso.parmisano@student.mogchs.edu.ph', '$2y$10$Np6T82E.M0eupPyMUuaynOK85OkHfQzIy4YOBLDvrgJ9t0BrMT312', 4, '405208150289', '', '', '', '0000-00-00', 19, 'Christianity', '', '', '', '', '', 5, 4, '2025-08-04 14:09:52', '2025-08-04 14:09:52');

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

--
-- Dumping data for table `tblstudentdocument`
--

INSERT INTO `tblstudentdocument` (`id`, `studentId`, `fileName`, `documentId`, `userId`, `createdAt`) VALUES
(1, '107129140272', 'SF10 - Patty.pdf', 5, '02-1819-01500', '2025-08-05 02:49:56');

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
('4771830', 'Maribelle', 'Acas', '', 'ralp.pelino11@gmail.com', '$2y$10$bShTWzdmWD68BWCS3wcF7eREQbYZaBY2kafbqx1.1cLwoGbGGTfI.', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 1, 5),
('4771833', 'Alexis', 'Gonzaga', '', 'alex@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 2, 9);

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
-- Indexes for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userLevel` (`userLevel`),
  ADD KEY `idx_student_lrn` (`lrn`),
  ADD KEY `idx_student_email` (`email`),
  ADD KEY `sectionId` (`sectionId`),
  ADD KEY `schoolyearId` (`schoolyearId`);

--
-- Indexes for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `userId` (`userId`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT for table `tblstatus`
--
ALTER TABLE `tblstatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Constraints for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD CONSTRAINT `tblstudent_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_2` FOREIGN KEY (`sectionId`) REFERENCES `tblsection` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_3` FOREIGN KEY (`schoolyearId`) REFERENCES `tblschoolyear` (`id`);

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
