SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `files`;

CREATE TABLE `files` (
	`fileId` tinyint(2) NOT NULL,
	`filename` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
	`data` mediumblob
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `files`
  ADD PRIMARY KEY (`fileId`);

ALTER TABLE `files`
  MODIFY `fileId` tinyint(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
	`userId` tinyint(2) NOT NULL,
	`username` varchar(8) COLLATE utf8_unicode_ci NOT NULL,
	`password` varchar(72) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

ALTER TABLE `users`
  MODIFY `userId` tinyint(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

DROP TABLE IF EXISTS `songs`;

CREATE TABLE `songs` (
  `songId` mediumint(9) NOT NULL,
  `username` varchar(8) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `artist` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `spotify` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `apple_music` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `deezer` varchar(200) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `songs`
  ADD PRIMARY KEY (`songId`);

ALTER TABLE `songs`
  MODIFY `songId` tinyint(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

COMMIT;