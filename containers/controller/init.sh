rm -rf /MEILI_Database

git clone https://github.com/Badger-MEILI/MEILI-Database /MEILI_Database
cd /MEILI_Database/SQL

psql -h db -U postgres -d SPOT_Gothenburg -a -f init.sql