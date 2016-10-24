rm -rf /MEILI_Database

git clone https://github.com/Badger-MEILI/MEILI-Database /MEILI_Database
cd /MEILI_Database/SQL

psql -v ON_ERROR_STOP=1 -h db -U postgres -d $POSTGRES_DB -a -f init.sql