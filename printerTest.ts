const fs = require('fs')
const Printer = require('ipp-printer')

const printer1 = new Printer({
  name: 'MyRolloPrinter1',
  port: 631,
  zeroconf: true,
  fallback: false,
})

const listener = (job: any) => {
  console.log('[job %d] Printing document: %s', job.id, job.name)
  var filename = 'job-' + job.id + '.pdf'
  var file = fs.createWriteStream(filename)
  job.on('end', function () {
    console.log('[job %d] Document saved as %s', job.id, filename)
  })
  job.pipe(file)
}

printer1.on('job', listener)
