[Unit]
Description=ffserver streaming server
After=syslog.target

[Service]
ExecStart=/usr/local/bin/ffserver -f /home/pi/raspberry-webcam-ffmpeg/ffserver.conf
Type=simple
Restart=always

[Install]
WantedBy=multi-user.target