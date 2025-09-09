import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
import plotly.express as px
import subprocess
import threading
import pandas as pd
import numpy as np
from datetime import datetime
import time

# Global variables
capturing = False
tshark_process = None
packet_data = pd.DataFrame()
metrics_data = []

# Define TShark command
tshark_command = [
    "tshark", "-i", "Wi-Fi", "-T", "fields",
    "-E", "header=y", "-E", "separator=,",
    "-e", "frame.time_epoch",     
    "-e", "ip.src",               
    "-e", "ip.dst",               
    "-e", "_ws.col.Protocol",     
    "-e", "frame.len",            
    "-e", "tcp.srcport",          
    "-e", "tcp.dstport",          
    "-e", "ip.ttl",               
    "-e", "tcp.flags",            
    "-e", "tcp.window_size_value",
    "-e", "tcp.analysis.ack_rtt", 
    "-e", "tcp.analysis.retransmission", 
    "-e", "frame.time_delta"      
]

# Calculate network metrics from packet data
def calculate_metrics(data):
    if data.empty:
        return {
            "timestamp": time.time(),
            "latency": 0,
            "jitter": 0,
            "bandwidth": 0,
            "packet_count": 0,
            "protocol_counts": {},
            "packet_sizes": []
        }
    
    # Basic metrics
    latency = data['ack_rtt'].dropna().mean() * 1000 if not data['ack_rtt'].dropna().empty else 0  # ms
    jitter = data['frame.time_delta'].dropna().std() * 1000 if not data['frame.time_delta'].dropna().empty else 0  # ms
    
    # Calculate bandwidth (bytes per second)
    total_bytes = data['frame.len'].sum()
    time_span = data['time'].max() - data['time'].min() if len(data) > 1 else 1
    bandwidth = (total_bytes * 8) / (time_span * 1000000) if time_span > 0 else 0  # Mbps
    
    # Count protocols
    protocol_counts = data['protocol'].value_counts().to_dict()
    
    return {
        "timestamp": time.time(),
        "latency": latency,
        "jitter": jitter,
        "bandwidth": bandwidth,
        "packet_count": len(data),
        "protocol_counts": protocol_counts,
        "packet_sizes": data['frame.len'].tolist()
    }

# Packet capture function
def start_packet_capture():
    global tshark_process, capturing, packet_data, metrics_data
    
    columns = [
        "time", "src_ip", "dst_ip", "protocol", "frame.len", "tcp_src_port",
        "tcp_dst_port", "ttl", "tcp_flags", "window_size", "ack_rtt",
        "retransmission", "frame.time_delta"
    ]
    
    packet_data = pd.DataFrame(columns=columns)
    capturing = True
    
    # Start tshark process
    tshark_process = subprocess.Popen(tshark_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    buffer = []
    try:
        while capturing:
            output = tshark_process.stdout.readline()
            if output == '' and tshark_process.poll() is not None:
                break
                
            if output:
                row = [item.strip() for item in output.strip().split(',')]
                if len(row) < 13:  # Skip incomplete rows
                    continue
                    
                try:
                    # Convert and validate data
                    data_row = {
                        "time": float(row[0]) if row[0] else np.nan,
                        "src_ip": row[1] if row[1] else "Unknown",
                        "dst_ip": row[2] if row[2] else "Unknown",
                        "protocol": row[3] if row[3] else "Unknown",
                        "frame.len": float(row[4]) if row[4] else 0,
                        "tcp_src_port": float(row[5]) if row[5] else np.nan,
                        "tcp_dst_port": float(row[6]) if row[6] else np.nan,
                        "ttl": float(row[7]) if row[7] else np.nan,
                        "tcp_flags": float(int(row[8], 16)) if row[8] and row[8].startswith('0x') else (float(row[8]) if row[8] else np.nan),
                        "window_size": float(row[9]) if row[9] else np.nan,
                        "ack_rtt": float(row[10]) if row[10] else np.nan,
                        "retransmission": int(row[11]) if row[11] else 0,
                        "frame.time_delta": float(row[12]) if row[12] else np.nan
                    }
                    
                    # Add to buffer
                    buffer.append(data_row)
                    
                    # Process buffer in batches
                    if len(buffer) >= 100:
                        batch_df = pd.DataFrame(buffer)
                        packet_data = pd.concat([packet_data, batch_df], ignore_index=True)
                        
                        # Keep only most recent data (to avoid memory issues)
                        if len(packet_data) > 5000:
                            packet_data = packet_data.tail(5000)
                            
                        # Calculate metrics
                        metrics = calculate_metrics(batch_df)
                        metrics_data.append(metrics)
                        
                        # Keep only recent metrics
                        if len(metrics_data) > 100:
                            metrics_data = metrics_data[-100:]
                            
                        # Reset buffer
                        buffer = []
                        
                except Exception as e:
                    print(f"Error processing packet: {e}")
                    continue
                    
    except Exception as e:
        print(f"Capture error: {e}")
    finally:
        if tshark_process:
            tshark_process.terminate()
            tshark_process = None
        capturing = False

# Initialize Dash app
app = dash.Dash(__name__, title='Network Monitor')

# Dark theme colors
dark_colors = {
    'background': '#111111',
    'text': '#7FDBFF',
    'grid': '#333333',
    'paper': '#222222'
}

# App layout
app.layout = html.Div(style={'backgroundColor': dark_colors['background'], 'color': dark_colors['text'], 'padding': '20px'}, children=[
    html.H1('Network Performance Dashboard', style={'textAlign': 'center', 'color': '#42f5f5'}),
    
    # Control buttons
    html.Div([
        html.Button('START CAPTURING', id='start-button', 
                   style={'backgroundColor': 'transparent', 'color': '#4CAF50', 'border': '1px solid #4CAF50', 
                          'padding': '10px 20px', 'margin': '10px', 'cursor': 'pointer', 'borderRadius': '5px'}),
        html.Button('STOP CAPTURING', id='stop-button', 
                   style={'backgroundColor': 'transparent', 'color': '#F44336', 'border': '1px solid #F44336', 
                          'padding': '10px 20px', 'margin': '10px', 'cursor': 'pointer', 'borderRadius': '5px'}),
        html.Button('SAVE DATA', id='save-button', 
                   style={'backgroundColor': 'transparent', 'color': '#FFB74D', 'border': '1px solid #FFB74D', 
                          'padding': '10px 20px', 'margin': '10px', 'cursor': 'pointer', 'borderRadius': '5px'}),
        
        # Status indicator
        html.Div([
            html.Span('Status: ', style={'marginRight': '10px'}),
            html.Span('Idle', id='status-text', style={'color': '#BDBDBD'})
        ], style={'padding': '10px', 'marginTop': '10px'})
    ], style={'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'flexWrap': 'wrap'}),
    
    # Main metrics
    html.Div([
        html.Div([
            html.H3('Total Data', style={'textAlign': 'center', 'color': '#E0E0E0', 'margin': '5px'}),
            html.Div('--', id='data-transferred', style={'fontSize': '36px', 'textAlign': 'center', 'color': '#4CAF50'})
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'}),
        
        html.Div([
            html.H3('Latency (ms)', style={'textAlign': 'center', 'color': '#E0E0E0', 'margin': '5px'}),
            html.Div('--', id='latency', style={'fontSize': '36px', 'textAlign': 'center', 'color': '#FFB74D'})
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'}),
        
        html.Div([
            html.H3('Bandwidth (Mbps)', style={'textAlign': 'center', 'color': '#E0E0E0', 'margin': '5px'}),
            html.Div('--', id='bandwidth', style={'fontSize': '36px', 'textAlign': 'center', 'color': '#29B6F6'})
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'})
    ], style={'display': 'flex', 'flexWrap': 'wrap'}),
    
    # Charts - first row
    html.Div([
        html.Div([
            dcc.Graph(id='protocol-pie')
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'}),
        
        html.Div([
            dcc.Graph(id='latency-chart')
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'})
    ], style={'display': 'flex', 'flexWrap': 'wrap'}),
    
    # Charts - second row
    html.Div([
        html.Div([
            dcc.Graph(id='packet-size-histogram')
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'}),
        
        html.Div([
            dcc.Graph(id='bandwidth-chart')
        ], style={'backgroundColor': dark_colors['paper'], 'padding': '15px', 'borderRadius': '5px', 'margin': '10px', 'flex': '1'})
    ], style={'display': 'flex', 'flexWrap': 'wrap'}),
    
    # Update interval
    dcc.Interval(
        id='interval-component',
        interval=2*1000,  # Update every 2 seconds
        n_intervals=0
    ),
    
    # Store component for data messages
    dcc.Store(id='save-message')
])

# Callback for start button
@app.callback(
    [Output('status-text', 'children'),
     Output('status-text', 'style')],
    [Input('start-button', 'n_clicks')],
    prevent_initial_call=True
)
def start_capture(n_clicks):
    if n_clicks is None:
        return 'Idle', {'color': '#BDBDBD'}
    
    global capturing
    if not capturing:
        # Start capture in a separate thread
        threading.Thread(target=start_packet_capture).start()
        return 'Capturing', {'color': '#4CAF50'}
    
    return 'Already capturing', {'color': '#4CAF50'}

# Callback for stop button
@app.callback(
    [Output('status-text', 'children', allow_duplicate=True),
     Output('status-text', 'style', allow_duplicate=True)],
    [Input('stop-button', 'n_clicks')],
    prevent_initial_call=True
)
def stop_capture(n_clicks):
    if n_clicks is None:
        return 'Idle', {'color': '#BDBDBD'}
    
    global capturing, tshark_process
    capturing = False
    if tshark_process:
        tshark_process.terminate()
        tshark_process = None
    
    return 'Stopped', {'color': '#F44336'}

# Callback for save button
@app.callback(
    Output('save-message', 'data'),
    Input('save-button', 'n_clicks'),
    prevent_initial_call=True
)
def save_data(n_clicks):
    if n_clicks is None:
        return None
    
    global packet_data
    if not packet_data.empty:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"network_data_{timestamp}.csv"
        packet_data.to_csv(filename, index=False)
        return f"Data saved to {filename}"
    
    return "No data to save"

# Callback to update metrics and charts
@app.callback(
    [Output('data-transferred', 'children'),
     Output('latency', 'children'),
     Output('bandwidth', 'children'),
     Output('protocol-pie', 'figure'),
     Output('latency-chart', 'figure'),
     Output('packet-size-histogram', 'figure'),
     Output('bandwidth-chart', 'figure')],
    [Input('interval-component', 'n_intervals')]
)
def update_metrics(n_intervals):
    global packet_data, metrics_data
    
    # Default values
    data_transferred = '--'
    latency = '--'
    bandwidth = '--'
    
    # Create protocol pie chart
    protocol_pie = go.Figure(
        data=[go.Pie(labels=['No Data'], values=[1])],
        layout=go.Layout(
            title="Protocol Distribution",
            paper_bgcolor=dark_colors['paper'],
            plot_bgcolor=dark_colors['paper'],
            font={'color': dark_colors['text']}
        )
    )
    
    # Create latency chart
    latency_chart = go.Figure(
        layout=go.Layout(
            title="Network Latency Over Time",
            xaxis_title="Time",
            yaxis_title="Latency (ms)",
            paper_bgcolor=dark_colors['paper'],
            plot_bgcolor=dark_colors['paper'],
            font={'color': dark_colors['text']},
            xaxis=dict(showgrid=True, gridcolor=dark_colors['grid']),
            yaxis=dict(showgrid=True, gridcolor=dark_colors['grid'])
        )
    )
    
    # Create packet size histogram
    packet_size_histogram = go.Figure(
        layout=go.Layout(
            title="Packet Size Distribution",
            xaxis_title="Packet Size (bytes)",
            yaxis_title="Count",
            paper_bgcolor=dark_colors['paper'],
            plot_bgcolor=dark_colors['paper'],
            font={'color': dark_colors['text']},
            xaxis=dict(showgrid=True, gridcolor=dark_colors['grid']),
            yaxis=dict(showgrid=True, gridcolor=dark_colors['grid'])
        )
    )
    
    # Create bandwidth chart
    bandwidth_chart = go.Figure(
        layout=go.Layout(
            title="Bandwidth Over Time",
            xaxis_title="Time",
            yaxis_title="Bandwidth (Mbps)",
            paper_bgcolor=dark_colors['paper'],
            plot_bgcolor=dark_colors['paper'],
            font={'color': dark_colors['text']},
            xaxis=dict(showgrid=True, gridcolor=dark_colors['grid']),
            yaxis=dict(showgrid=True, gridcolor=dark_colors['grid'])
        )
    )
    
    if not packet_data.empty and metrics_data:
        # Update main metrics
        total_data_kb = round(packet_data['frame.len'].sum() / 1024, 2)
        data_transferred = f"{total_data_kb} KB"
        
        # Get latest metrics
        latest_metrics = metrics_data[-1]
        latency = f"{round(latest_metrics['latency'], 2)}"
        bandwidth = f"{round(latest_metrics['bandwidth'], 2)}"
        
        # Update protocol pie chart
        if latest_metrics['protocol_counts']:
            protocol_labels = list(latest_metrics['protocol_counts'].keys())
            protocol_values = list(latest_metrics['protocol_counts'].values())
            protocol_pie = go.Figure(
                data=[go.Pie(
                    labels=protocol_labels, 
                    values=protocol_values,
                    marker=dict(colors=px.colors.sequential.Blues_r)
                )],
                layout=go.Layout(
                    title="Protocol Distribution",
                    paper_bgcolor=dark_colors['paper'],
                    plot_bgcolor=dark_colors['paper'],
                    font={'color': dark_colors['text']}
                )
            )
        
        # Update latency chart
        timestamps = [datetime.fromtimestamp(m['timestamp']) for m in metrics_data]
        latencies = [m['latency'] for m in metrics_data]
        latency_chart.add_trace(go.Scatter(
            x=timestamps,
            y=latencies,
            mode='lines',
            line=dict(color='#4CAF50', width=2)
        ))
        
        # Update packet size histogram
        if latest_metrics['packet_sizes']:
            packet_size_histogram = go.Figure(
                data=[go.Histogram(
                    x=latest_metrics['packet_sizes'],
                    nbinsx=20,
                    marker=dict(color='#29B6F6')
                )],
                layout=go.Layout(
                    title="Packet Size Distribution",
                    xaxis_title="Packet Size (bytes)",
                    yaxis_title="Count",
                    paper_bgcolor=dark_colors['paper'],
                    plot_bgcolor=dark_colors['paper'],
                    font={'color': dark_colors['text']},
                    xaxis=dict(showgrid=True, gridcolor=dark_colors['grid']),
                    yaxis=dict(showgrid=True, gridcolor=dark_colors['grid'])
                )
            )
        
        # Update bandwidth chart
        bandwidths = [m['bandwidth'] for m in metrics_data]
        bandwidth_chart.add_trace(go.Scatter(
            x=timestamps,
            y=bandwidths,
            mode='lines',
            line=dict(color='#FFB74D', width=2)
        ))
    
    return data_transferred, latency, bandwidth, protocol_pie, latency_chart, packet_size_histogram, bandwidth_chart

# Run the app
if __name__ == '__main__':
    app.run(debug=True)