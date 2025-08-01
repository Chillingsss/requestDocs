-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 29, 2025 at 06:15 PM
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
(11, '02-1818-01509', 5, 'College Application', '2025-07-24 10:05:43'),
(12, '02-1818-01509', 6, 'Employment', '2025-07-24 11:28:16'),
(13, '02-1818-01509', 5, 'Employment', '2025-07-25 08:20:55'),
(14, '02-1818-01509', 6, 'Employment', '2025-07-25 08:25:46');

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
(7, 11, 1, NULL, '2025-07-24 10:05:43'),
(8, 11, 2, NULL, '2025-07-24 10:22:47'),
(9, 11, 2, NULL, '2025-07-24 10:22:51'),
(10, 11, 3, NULL, '2025-07-24 11:07:45'),
(11, 11, 4, NULL, '2025-07-24 11:21:17'),
(12, 12, 1, NULL, '2025-07-24 11:28:16'),
(13, 11, 5, NULL, '2025-07-24 11:29:03'),
(14, 13, 1, NULL, '2025-07-25 08:20:55'),
(15, 14, 1, NULL, '2025-07-25 08:25:46');

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
(1, 13, 'farm.png', 1, '2025-07-25 08:20:55'),
(2, 13, 'licenseId2.png', 2, '2025-07-25 08:20:55'),
(3, 14, 'licenseId.png', 2, '2025-07-25 08:25:46');

-- --------------------------------------------------------

--
-- Table structure for table `tblrequirementstype`
--

CREATE TABLE `tblrequirementstype` (
  `id` int(11) NOT NULL,
  `nameType` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblrequirementstype`
--

INSERT INTO `tblrequirementstype` (`id`, `nameType`, `userId`, `createdAt`) VALUES
(1, 'Diploma', '02-1819-01509', '2025-07-25 07:04:12'),
(2, 'Affidavit of Loss', '02-1819-01509', '2025-07-25 07:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `tblsection`
--

CREATE TABLE `tblsection` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsection`
--

INSERT INTO `tblsection` (`id`, `name`, `userId`, `createdAt`) VALUES
(1, 'Efficient', '4771830', '2025-07-29 17:37:38'),
(2, 'Elegant', '4771830', '2025-07-29 17:37:38'),
(3, 'Eligible', '4771830', '2025-07-29 17:37:38'),
(4, 'Eloquent', '4771830', '2025-07-29 17:37:38'),
(5, 'Empowered', '4771830', '2025-07-29 17:37:38'),
(6, 'Enduring', '4771830', '2025-07-29 17:37:38'),
(7, 'Enthusiam', '4771830', '2025-07-29 17:37:38'),
(8, 'Evident', '4771830', '2025-07-29 17:37:38');

-- --------------------------------------------------------

--
-- Table structure for table `tblsfrecord`
--

CREATE TABLE `tblsfrecord` (
  `id` int(11) NOT NULL,
  `fileName` varchar(100) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `sfTypeId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsfrecord`
--

INSERT INTO `tblsfrecord` (`id`, `fileName`, `studentId`, `sfTypeId`, `userId`, `createdAt`) VALUES
(1, 'SF10 - Patty.xlsx', '02-1818-01509', 1, '02-1819-01509', '2025-07-29 05:12:07'),
(2, 'SF10 - Patty.xlsx', '02-1818-01509', 2, '4771830', '2025-07-29 05:51:57');

-- --------------------------------------------------------

--
-- Table structure for table `tblsftype`
--

CREATE TABLE `tblsftype` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsftype`
--

INSERT INTO `tblsftype` (`id`, `name`, `userId`, `createdAt`) VALUES
(1, 'Grade 11', '02-1819-01509', '2025-07-29 04:14:38'),
(2, 'Grade 12', '02-1819-01509', '2025-07-29 04:14:38');

-- --------------------------------------------------------

--
-- Table structure for table `tblstatus`
--

CREATE TABLE `tblstatus` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstatus`
--

INSERT INTO `tblstatus` (`id`, `name`, `user_id`, `createdAt`) VALUES
(1, 'Pending', '02-1819-01509', '2025-07-24 13:52:56'),
(2, 'Processed', '02-1819-01509', '2025-07-24 13:52:56'),
(3, 'Signatory', '02-1819-01509', '2025-07-24 13:52:56'),
(4, 'Release', '02-1819-01509', '2025-07-24 13:52:56'),
(5, 'Released', '02-1819-01509', '2025-07-24 13:52:56');

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
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstudent`
--

INSERT INTO `tblstudent` (`id`, `firstname`, `middlename`, `lastname`, `email`, `password`, `userLevel`, `lrn`, `track`, `strand`, `section`, `birthDate`, `age`, `religion`, `completeAddress`, `fatherName`, `motherName`, `guardianName`, `guardianRelationship`, `sectionId`, `createdAt`, `updatedAt`) VALUES
('02-1818-01509', 'Patty', '', 'Aspiras', 'patty@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 4, '02-1819-01509', NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, '2025-07-29 15:43:36', '2025-07-29 15:44:23'),
('104819130115', 'MIKAELA', 'ESTOQUE', 'BUNGCAYAO', 'mikaela.bungcayao@mogchs.edu.ph', '$2y$10$aMH5516alLcnRgDM42cjh.VOR564zgwE7A94Mpw8cK/GmSoHquIbm', 4, '104819130115', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('118350130019', 'PEARL', 'MARIE AMPARO', 'PERILLO', 'pearl.perillo@mogchs.edu.ph', '$2y$10$t/G.JMZGMn2Rjx1KB1iA7.QU6FVyD1Wql0.N3ap60ZYC5kK9kJv12', 4, '118350130019', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('119871150147', 'DONNICA', 'ELLA ELMIDO', 'BARDOS', 'donnica.bardos@student.mogchs.edu.ph', '$2y$10$ugO3GcjHiH8pcmBRDCK08uWhKqeQfWvd83P5LeOR8GVoz0mu.SxQe', 4, '119871150147', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('125615140024', 'GIFFORD', 'DAZIL VALLES', 'CASTILLON', 'gifford.castillon@student.mogchs.edu.ph', '$2y$10$YJvXpYdT8qPY8OaOtlZPt./Z1cD94.AO48Cr6InhfmrlJkLZ4JOpW', 4, '125615140024', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('126332140046', 'EZEKHIA', 'BIA', 'DAVE', 'ezekhia.dave@student.mogchs.edu.ph', '$2y$10$pav40S5aAkYmkSoshL1bS.EXhOyej7u73kEr.8w7U8SleGSIzQPNi', 4, '126332140046', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('126421150124', 'ALDREEVE', '-', 'COMPOSA', 'aldreeve.composa@mogchs.edu.ph', '$2y$10$4yk4PSFxbGsOdM0ySvl.wOQM0N66OSHDKHdUtRqrhaDi0siOVippe', 4, '126421150124', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('126625130035', 'JAY', 'DAVE TEOFILO', 'GICA', 'jay.gica@mogchs.edu.ph', '$2y$10$9123b9RlO9aAb9yujpGSrO14s98TotnEv2hgcn560QllOnAb57ZxW', 4, '126625130035', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('126625130039', 'NICOLE', 'DAVE TAYCO', 'TEOFILO', 'nicole.teofilo@mogchs.edu.ph', '$2y$10$YUP1MK6.d3GR/hVPM0sy/eEOYHCJrixcpy1Aw9CwDGgjgZE0GDli6', 4, '126625130039', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('127772140006', 'JAN', 'REYNE MALASABAS', 'LASTIMA', 'jan.lastima@student.mogchs.edu.ph', '$2y$10$f/s98gRHqZvPihOzKwH7MuyN4ASncvFVzmkZzj0jUyJ6vKxrTOHGC', 4, '127772140006', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127905140043', 'IVAN', 'JAMES -', 'LABUNOS', 'ivan.labunos@student.mogchs.edu.ph', '$2y$10$D/qfCiQf0l7FJTZFhfN52.3v2qufImn0evxWMfrYSrNa//B5LGYZi', 4, '127905140043', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127940120005', 'MARK', 'JOHN AGUSTIN SALAMANCA', 'CALUNSAG', 'mark.calunsag@student.mogchs.edu.ph', '$2y$10$npfUPeLO3gf5m7WtHjJ4XOxgyw/LCb.x5qJa.05ZVKmPDYN9hepsq', 4, '127940120005', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127940140242', 'AIDA', 'MAE MIRAL', 'LAMACLAMAC', 'aida.lamaclamac@student.mogchs.edu.ph', '$2y$10$i2BKAVMx1GJRkeOhxQclx.R1NqU5zmcF1rinJhbS8pcZQqRR9ZiVO', 4, '127940140242', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127940140522', 'RICHMOND', 'GENSON', 'SARAUS', 'richmond.saraus@student.mogchs.edu.ph', '$2y$10$7oDNxk4ad7YL4quIHFwdD.IehEZyVOHfxmx6MLoU0dd8SjplQO4lC', 4, '127940140522', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127940140626', 'KENT', 'PATRICK MONDILLA', 'ESCABARTE', 'kent.escabarte@mogchs.edu.ph', '$2y$10$GEZothqlb1/FzTErNJf21ek8biwiGbOikyFN1bECne07TLembKXLi', 4, '127940140626', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('127940140968', 'MAE', 'KAELA LUENGO', 'GERALI', 'mae.gerali@student.mogchs.edu.ph', '$2y$10$w2KfBfCHpVPSGuEPc9MYYuQLNEi/LTglP2g1ksQ275.VL0CQx6AUu', 4, '127940140968', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127940141142', 'EUNICE', 'RAGANAS', 'GERALI', 'eunice.gerali@student.mogchs.edu.ph', '$2y$10$2JSTqfryvKYANYh0PKlC/OZ/BqDQMKybjSzCvUK93H67a88m8s6yq', 4, '127940141142', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127940150642', 'CHRISTINE', 'JOY YAP', 'OLAPE', 'christine.olape@student.mogchs.edu.ph', '$2y$10$X4ya6b89mpThYUWLBup/COj43S0mFFm5hrvKbuQuC5P1YW11P8B5S', 4, '127940150642', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127940150938', 'EDZEHL', 'JAKIM PALER', 'SAMSON', 'edzehl.samson@mogchs.edu.ph', '$2y$10$/KsmGQY8bIegbEewz/NVv.RRVfdSb46rZTK2c/pY75CiRPehThkeu', 4, '127940150938', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('127941140425', 'LISLIE', 'JANE SABAS', 'ALLECIR', 'lislie.allecir@student.mogchs.edu.ph', '$2y$10$UQqZaSIiyr.Usv7w8yDWtuS1tygKoPCkpygsuDAuyau.KwZ0Kw8/S', 4, '127941140425', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127942100719', 'JULINA', 'ENECITO', 'TORDILLO', 'julina.tordillo@student.mogchs.edu.ph', '$2y$10$TJxLuER5b/GeBrUDNu7t8uWCiq9UD869DR5CliVatFnMZHyVi3U1y', 4, '127942100719', '', '', '', '0000-00-00', 21, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127942130392', 'ANDRE', 'QUINTO', 'JORILLA', 'andre.jorilla@mogchs.edu.ph', '$2y$10$G/zBiSd3mpgYN8hQW1lSSexf787tIsKzU6.0Jgy6uNdCTf57L70r6', 4, '127942130392', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('127942140389', 'TRECIA', 'JOYCE TACULOD', 'RODRIGUEZ', 'trecia.rodriguez@mogchs.edu.ph', '$2y$10$oZVK4NFN4PC5lPwl7KHCDOestbEVtlVVmlUOneS4NSKKB1fuCwcay', 4, '127942140389', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('127944130830', 'PHOEBE', 'JANE DURBAN', 'LABRADOR', 'phoebe.labrador@student.mogchs.edu.ph', '$2y$10$EFE7aInV2cFf5Nv3CNxS8ONN8vXZNeIkUqkJda9kevdA2OSx5XZ1u', 4, '127944130830', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127944140816', 'WENCY', 'GABRIEL', 'OGHAYON', 'wency.oghayon@student.mogchs.edu.ph', '$2y$10$cnmQzPVIohEdJia7yXmiJuO00qbQqZrkurfLH4N2nK2ubHbl1DTc2', 4, '127944140816', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127947120341', 'JOHN', 'MARK MACADILDIG', 'ABRIO', 'john.abrio@student.mogchs.edu.ph', '$2y$10$nfBjWwiypTpQjLKCBqGa..iwLzKgLAk.Zo5VFWnE26E689.CydGOm', 4, '127947120341', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127955140019', 'AILYN', 'MAGALLANES', 'CELIS', 'ailyn.celis@student.mogchs.edu.ph', '$2y$10$PPyZgzOc0qLWqcWKSTf6ce3N6dTTVtzf.Hp7iSI0tYqt1oUlEBKcu', 4, '127955140019', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127955140061', 'KURT', 'JHON ENDRINA', 'PLAMOR', 'kurt.plamor@student.mogchs.edu.ph', '$2y$10$L8WN4ckLyLHjszl/pV6ZBOFIqYJ6MGrMxGT24SWfIsghMy77sD/O6', 4, '127955140061', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127958120001', 'SAMUEL', 'TURA', 'ALOZO', 'samuel.alozo@mogchs.edu.ph', '$2y$10$Hq6IUQVjIOzSUR73FqZm.OFRsgT.so3A6CXBQf5SnvC3clWluIA6C', 4, '127958120001', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:48', '2025-07-29 15:59:48'),
('127958130112', 'JAN', 'MELLER USMAN', 'CULLAMAT', 'jan.cullamat@student.mogchs.edu.ph', '$2y$10$VFC.q8jU1JX/LuzCgwCS0u1AXh1f1A0oXrwmtcnEwPMa6efwye2F6', 4, '127958130112', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127958140102', 'PRINCESS', 'ADAH LANTAO', 'MARGATINEZ', 'princess.margatinez@student.mogchs.edu.ph', '$2y$10$0QTtkVSEmJ.1HH0F89sdd.yt60EecrAvdMK9ZvYq1ZYJYYQrIG472', 4, '127958140102', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127959140153', 'JESS', 'WRENSER CUARESMA', 'VIDAL', 'jess.vidal@student.mogchs.edu.ph', '$2y$10$v5Q6OZ50bVnurHJygzuIo.i5JkAjiph5yvBGCKCdBtk.e4OESURRy', 4, '127959140153', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127959140297', 'MARRIE', 'JOY SUBINGSUBING', 'EPAN', 'marrie.epan@student.mogchs.edu.ph', '$2y$10$0Q2XqfrluaG/hx2tSpzlEudJJBa3Onasj3BFtgrBvuQALLbVMavlu', 4, '127959140297', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127961140304', 'PHILJOHN', 'MABAO', 'LLAMERA', 'philjohn.llamera@student.mogchs.edu.ph', '$2y$10$BM12iF/K5SFr2FtJb9K3KepZl55PvU4s.R9xLNEfW91Ic3TDt9Cii', 4, '127961140304', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127962140234', 'GEORGIE', 'MARIE VELONO', 'REDUBLADO', 'georgie.redublado@student.mogchs.edu.ph', '$2y$10$juAVxXgLgXQm5URg/VTK.O8yzEnXO98W1A.iJQJs0g4nMSzdldsOO', 4, '127962140234', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127963130087', 'KHALEL', 'JO ANG', 'AMARGA', 'khalel.amarga@mogchs.edu.ph', '$2y$10$.wisRnf.Inr6SulNRRcadu7OCvzyhth4IgO1CuG1abKeqgY6O882e', 4, '127963130087', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('127964120671', 'ANGEL', 'KIM SUICO', 'ALUNAN', 'angel.alunan@student.mogchs.edu.ph', '$2y$10$ZUWt7m4mveunQxXCx0pGm.JQfRi6apLj8wbHkrGsuxNOR73AJWtQS', 4, '127964120671', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('127990140188', 'JASSIN', 'SALOMABAO', 'BANTUAS', 'jassin.bantuas@student.mogchs.edu.ph', '$2y$10$TPCQ9fKTD/6aPDG65t98k.K/l8PHZVq0p.YzpgsSij2mRO.eVlSwe', 4, '127990140188', '', '', '', '0000-00-00', 16, 'Islam', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56'),
('127992140071', 'ED', 'RYAN PIMENTEL', 'ABELLON', 'ed.abellon@mogchs.edu.ph', '$2y$10$72yL7oKQdDSuCdctb5e1m.HHnwBala8AbsN0zEHvpKSjnOfohfELi', 4, '127992140071', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:48', '2025-07-29 15:59:48'),
('127992140153', 'RHAIZA', 'INSON', 'MOLEJON', 'rhaiza.molejon@student.mogchs.edu.ph', '$2y$10$BXeel/sbjgNsYkOb1VN3g.a6yQfbTJijH7xXWwtBm.RBPKfsIcLIi', 4, '127992140153', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127994140114', 'JULIA', 'TUNGAL', 'VALLARES', 'julia.vallares@student.mogchs.edu.ph', '$2y$10$dVKslKmUiW/pdJNZWclm4eWGwMljPYSvJzKmtBR.3VWTPYCrqN0r2', 4, '127994140114', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('127995120980', 'MARK', 'ANTHONY RACAL', 'ABELLANOSA', 'mark.abellanosa@mogchs.edu.ph', '$2y$10$vdqpwvO/v5ub8bmV9d5ztuHMthRaMa3AIgvs5sGeC8n5kjnEVHPLq', 4, '127995120980', '', '', '', '0000-00-00', 18, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:48', '2025-07-29 15:59:48'),
('127995141190', 'SHALLEMAE', 'DAHULORAN', 'NAVARRO', 'shallemae.navarro@student.mogchs.edu.ph', '$2y$10$0l3F8gByUJDXaaYT6gt.AeHS78Kpr8v/zQwx1J61BtGkvx2lX.KLm', 4, '127995141190', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('128003140174', 'REGINE', 'SANTE', 'DAYO', 'regine.dayo@student.mogchs.edu.ph', '$2y$10$CRigigfqbsnj3A2CAsWlyuNBC/EO93gMekw7t/Tl6ts4svxsA497m', 4, '128003140174', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('128038140110', 'LOVELY', 'MAE ESCORA', 'DOLLECEN', 'lovely.dollecen@student.mogchs.edu.ph', '$2y$10$6b5hqdUOADO/wNwGKTcOPe1Ajla0PXAK.lzp1.BVBBW0.Ev8o8goa', 4, '128038140110', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('128529140027', 'CHARICE', 'ANE GUINAYHAN', 'CALINAO', 'charice.calinao@student.mogchs.edu.ph', '$2y$10$z/XbrPq9wQSVdb0P7bQ1Lei4p.AabiHG7tOScS6WEPFQQCWX5uUgu', 4, '128529140027', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('130621140035', 'REA', 'MABANO', 'GADOR', 'rea.gador@student.mogchs.edu.ph', '$2y$10$wsYvsqlZBJehdIJFMHukxul5NhFfh4Ij6XFDNc907QPNfw84uSGCC', 4, '130621140035', '', '', '', '0000-00-00', 16, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('132050130173', 'JUMAR', 'BUSANO', 'CELERES', 'jumar.celeres@mogchs.edu.ph', '$2y$10$POO4DBGPxqIYp6nMODv/8.w2qX.Yn/TM89QrJKo9tykZxvCQA3aeu', 4, '132050130173', '', '', '', '0000-00-00', 17, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:49', '2025-07-29 15:59:49'),
('132895140021', 'ANGELICA', 'EVANGELIO', 'ADLAON', 'angelica.adlaon@student.mogchs.edu.ph', '$2y$10$joBbHLyRvNyTAONeC.z1CuqJ2LKhJqASWI.nw9PRRCzxxd/n6e1Xm', 4, '132895140021', '', '', '', '0000-00-00', 15, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:57', '2025-07-29 16:12:57'),
('133693150003', 'SITTIE', 'YASHLY GUNTING', 'PASANDALAN', 'sittie.pasandalan@student.mogchs.edu.ph', '$2y$10$vtNEynfMj3KTadCiW6zo5eg7oMtKqBb4ynP4odt9mkX5DMy9FhBLO', 4, '133693150003', '', '', '', '0000-00-00', 15, 'Islam', '', '', '', '', '', 1, '2025-07-29 16:12:58', '2025-07-29 16:12:58'),
('405235150610', 'MARC', 'GABRIEL MACALAM', 'ANDOY', 'marc.andoy@mogchs.edu.ph', '$2y$10$L.TJTVuYJsmKZNN6OwIYQeRc4NqoHqnfHMGHclS5P6NDtrNUXEMMK', 4, '405235150610', '', '', '', '0000-00-00', 20, 'Christianity', '', '', '', '', '', 2, '2025-07-29 15:59:48', '2025-07-29 15:59:48'),
('510062300284', 'STEVEN', 'SON BAYBAY', 'RAMONAL', 'steven.ramonal@student.mogchs.edu.ph', '$2y$10$b0l7MXpMCkRGcr4Cle7Zd.ysNqbHyhfl/cODmXssusUEDgpG9DeHa', 4, '510062300284', '', '', '', '0000-00-00', 1, 'Christianity', '', '', '', '', '', 1, '2025-07-29 16:12:56', '2025-07-29 16:12:56');

-- --------------------------------------------------------

--
-- Table structure for table `tblstudentdocument`
--

CREATE TABLE `tblstudentdocument` (
  `id` int(11) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `fileName` varchar(100) NOT NULL,
  `documentId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstudentdocument`
--

INSERT INTO `tblstudentdocument` (`id`, `studentId`, `fileName`, `documentId`, `userId`, `createdAt`) VALUES
(1, '02-1818-01509', 'SF10 - Patty.pdf', 5, '02-1819-01500', '2025-07-25 21:23:52');

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
  `pinCode` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbluser`
--

INSERT INTO `tbluser` (`id`, `firstname`, `lastname`, `middlename`, `email`, `password`, `userLevel`, `pinCode`) VALUES
('02-1819-01500', 'Krystyll', 'Plaza', '', 'krystyll@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 1, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.'),
('02-1819-01509', 'Patty', 'Aspiras', '', 'ralp.pelino11@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 2, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.'),
('4771830', 'Maribelle', 'Acas', '', 'maribelle.acac@depded.gov.ph', '$2y$10$FHqmhGrhwClnozNCoI5HE.Jq7NIVnQNOmF6VrFTsSUJ9LhrJ8YenC', 3, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.');

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
-- Indexes for table `tblsection`
--
ALTER TABLE `tblsection`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sfTypeId` (`sfTypeId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblsftype`
--
ALTER TABLE `tblsftype`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblstatus`
--
ALTER TABLE `tblstatus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userLevel` (`userLevel`),
  ADD KEY `idx_student_lrn` (`lrn`),
  ADD KEY `idx_student_email` (`email`),
  ADD KEY `sectionId` (`sectionId`);

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
  ADD KEY `user_level` (`userLevel`);

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
-- AUTO_INCREMENT for table `tblrequest`
--
ALTER TABLE `tblrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblsection`
--
ALTER TABLE `tblsection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblsftype`
--
ALTER TABLE `tblsftype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  ADD CONSTRAINT `tblsection_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  ADD CONSTRAINT `tblsfrecord_ibfk_1` FOREIGN KEY (`sfTypeId`) REFERENCES `tblsftype` (`id`),
  ADD CONSTRAINT `tblsfrecord_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`),
  ADD CONSTRAINT `tblsfrecord_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblsftype`
--
ALTER TABLE `tblsftype`
  ADD CONSTRAINT `tblsftype_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblstatus`
--
ALTER TABLE `tblstatus`
  ADD CONSTRAINT `tblstatus_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD CONSTRAINT `tblstudent_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_2` FOREIGN KEY (`sectionId`) REFERENCES `tblsection` (`id`);

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
  ADD CONSTRAINT `tbluser_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
