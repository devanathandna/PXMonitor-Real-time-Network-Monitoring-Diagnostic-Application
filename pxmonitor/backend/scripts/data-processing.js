function processRawPacketData(rawData) {
  if (!rawData || !rawData.trim()) return [];
  
  const rows = rawData.trim().split('\n');
  if (rows.length < 2 || !rows[0].includes('frame.time_epoch')) {
    console.warn('Invalid or missing headers:', rows[0]);
    return [];
  }
  
  const headers = rows[0].split(',').map(h => h.trim());
  //console.log('Headers found:', headers); // Debug headers
  const packets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      console.warn('Skipping malformed row:', rows[i]);
      continue;
    }
    
    const packet = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      switch (header) {
        case 'frame.time_epoch': packet.time = value ? parseFloat(value) : null; break;
        case 'ip.src': packet.srcIp = value || 'Unknown'; break;
        case 'ip.dst': packet.dstIp = value || 'Unknown'; break;
        case '_ws.col.protocol': 
          packet.protocol = value || 'Unknown'; 
          if (value && value !== 'Unknown' && value.trim() !== '') {
            //console.log('Protocol captured:', value); // Debug protocol
          }
          break;
        case 'frame.len': packet.frameLen = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0; break;
        case 'tcp.srcport': packet.tcp_src_port = value ? parseFloat(value) : null; break;
        case 'tcp.dstport': packet.tcp_dst_port = value ? parseFloat(value) : null; break;
        case 'ip.ttl': packet.ttl = value ? parseFloat(value) : null; break;
        case 'tcp.flags': 
          packet.tcpFlags = value ? (value.startsWith('0x') ? parseInt(value.substring(2), 16) : parseFloat(value)) : null; 
          break;
        case 'tcp.window_size_value': packet.window_size = value ? parseFloat(value) : null; break;
        case 'tcp.analysis.ack_rtt': packet.ack_rtt = value ? parseFloat(value) : null; break;
        case 'tcp.analysis.retransmission': packet.retransmission = value ? parseInt(value) : 0; break;
        case 'frame.time_delta': packet.time_delta = value ? parseFloat(value) : null; break;
        case 'dns.time': packet.dns_time = value ? parseFloat(value) : null; break;
        default: packet[header] = value;
      }
    });
    
    // Debug the processed packet protocol
    if (packet.protocol && packet.protocol !== 'Unknown') {
      //console.log(`Packet ${i} protocol: "${packet.protocol}"`);
    }
    
    packets.push(packet);
  }
  
  // Debug protocol distribution
  const protocolCounts = {};
  packets.forEach(p => {
    const protocol = p.protocol || 'Unknown';
    protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1;
  });
  //console.log('Protocol distribution in processed packets:', protocolCounts);
  
  return packets;
}

function batchProcessPackets(packets, batchSize = 100) {
  const results = [];
  for (let i = 0; i < packets.length; i += batchSize) {
    const batch = packets.slice(i, i + batchSize);
    results.push(batch);
  }
  return results;
}

function cleanPacketData(packets) {
  if (!packets || packets.length === 0) return [];
  return packets.filter(packet => {
    if (!packet.time || !packet.protocol || packet.frameLen === 0) return false;
    if (packet.frameLen > 100000 || (packet.ack_rtt !== null && packet.ack_rtt > 10)) return false;
    return true;
  });
}

export {
  processRawPacketData,
  batchProcessPackets,
  cleanPacketData
};