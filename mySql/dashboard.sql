drop procedure if exists GetDashboardData;
delimiter //
create procedure GetDashboardData(IN `startDate` DATE, IN `endDate` DATE)
BEGIN
select DATE_FORMAT(EntryDate, "%M %Y") `Month`, isExpense, SUM(AMOUNT) `Amount` 
from register WHERE EntryDate >= startDate and EntryDate <= endDate 
group by MONTH(EntryDate),isExpense
order by EntryDate DESC;
END //
delimiter ;

--Added new Bank column to register table
ALTER TABLE  `register` ADD  `Bank` INT NULL DEFAULT NULL COMMENT  'Bank ID';

--Create favourties table
CREATE TABLE 'favourties'
(
    Id int,
    Favourite varchar(200)
)