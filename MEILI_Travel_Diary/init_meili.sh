npm install

min_lat=
min_lon=
max_lat=
max_lon=
username=
dbname= 
dbhost= 

while :; do
    case $1 in
        -h|--hostdb)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                dbhost=$2
                shift
            else
                printf 'ERROR: "--hostdb" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --hostdb=?*)
          dbhost=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --hostdb=)
          printf 'ERROR: "--hostdb" requires a non-empty option argument.\n' >&2
          ;;
        -u|--username)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                username=$2
                shift
            else
                printf 'ERROR: "--username" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --username=?*)
          username=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --username=)
          printf 'ERROR: "--username" requires a non-empty option argument.\n' >&2
          ;;
        -n|--namedb)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                dbname=$2
                shift
            else
                printf 'ERROR: "--namedb" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --namedb=?*)
          dbname=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --namedb=)
          printf 'ERROR: "--namedb" requires a non-empty option argument.\n' >&2
          ;;
        -a|--min_lat)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                min_lat=$2
                shift
            else
                printf 'ERROR: "--min_lat" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --min_lat=?*)
          min_lat=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --min_lat=)
          printf 'ERROR: "--min_lat" requires a non-empty option argument.\n' >&2
          ;;
        -b|--min_lon)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                min_lon=$2
                shift
            else
                printf 'ERROR: "--min_lon" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --min_lon=?*)
          min_lon=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --min_lon=)
          printf 'ERROR: "--min_lon" requires a non-empty option argument.\n' >&2
          ;;
        -c|--max_lat)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                max_lat=$2
                shift
            else
                printf 'ERROR: "--max_lat" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --max_lat=?*)
          max_lat=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --max_lat=)
          printf 'ERROR: "--max_lat" requires a non-empty option argument.\n' >&2
          ;;
        -d|--max_lon)       # Takes an option argument, ensuring it has been specified.
            if [ -n "$2" ]; then
                max_lon=$2
                shift
            else
                printf 'ERROR: "--max_lon" requires a non-empty option argument.\n' >&2
                exit 1
            fi
            ;;
        --max_lon=?*)
          max_lon=${1#*=} # Delete everything up to "=" and assign the remainder.
          ;;
        --max_lon=)
          printf 'ERROR: "--max_lon" requires a non-empty option argument.\n' >&2
          ;;
        --)              # End of all options.
          shift
          break
          ;;
        -?*)
            printf 'WARN: Unknown option (ignored): %s\n' "$1" >&2
            ;;
        *)               # Default case: If no more options then break out of the loop.
            break
    esac

    shift
done

echo min lat $min_lat min lon $min_lon max lat $max_lat max lon $max_lon db name $dbname user name $username db host $dbhost
git clone git://github.com/Badger-MEILI/MEILI-Database.git
createdb $dbname -U $username
eval cd "MEILI-Database/SQL"
ls
bash initialize_meili.sh $min_lat $min_lon $max_lat $max_lon $dbname $username $dbhost

echo Make the following modifications to routes/database.js 
echo host = $dbhost 
echo dbName = $dbname
echo userName = $username 

echo Do not forget to add your password and port number!
