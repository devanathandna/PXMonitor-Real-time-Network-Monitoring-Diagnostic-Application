import subprocess
import pandas as pd

# Define columns for the DataFrame
columns = [
    "time", "src_ip", "dst_ip", "protocol", "packet_length", "tcp_src_port",
    "tcp_dst_port", "ttl", "tcp_flags", "window_size", "ack_rtt",
    "retransmission", "time_delta"
]

# TShark command with explicit field ordering
tshark_command = [
    "tshark", "-i", "Wi-Fi", "-T", "fields",
    "-E", "header=y", "-E", "separator=,",
    "-e", "frame.time_epoch",     # Field 0: time
    "-e", "ip.src",               # Field 1: source IP
    "-e", "ip.dst",               # Field 2: destination IP
    "-e", "_ws.col.Protocol",     # Field 3: protocol
    "-e", "frame.len",            # Field 4: packet length
    "-e", "tcp.srcport",          # Field 5: TCP source port
    "-e", "tcp.dstport",          # Field 6: TCP destination port
    "-e", "ip.ttl",               # Field 7: TTL
    "-e", "tcp.flags",            # Field 8: TCP flags
    "-e", "tcp.window_size_value",# Field 9: window size
    "-e", "tcp.analysis.ack_rtt", # Field 10: ACK RTT
    "-e", "tcp.analysis.retransmission", # Field 11: retransmission
    "-e", "frame.time_delta"      # Field 12: time delta
]

# Capture Function
def start_packet_capture():
    process = subprocess.Popen(tshark_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    try:
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break

            if output:
                # Process the output line from tshark
                line = output.strip()
                fields = line.split(",")
                if len(fields) == len(columns):
                    # Convert the output directly to a DataFrame and print it
                    data = pd.DataFrame([fields], columns=columns)
                    print(data)

    except KeyboardInterrupt:
        print("Capture stopped.")

    finally:
        process.stdout.close()
        process.stderr.close()
        process.wait()

# Start packet capture and print data to the terminal
start_packet_capture()
