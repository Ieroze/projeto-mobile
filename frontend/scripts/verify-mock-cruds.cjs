const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Executa os repositories TypeScript em Node sem dependência de teste adicional.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

const { catRepository } = require('../src/services/catRepository.ts');
const { catAdminRepository } = require('../src/services/catAdminRepository.ts');
const { campaignRepository } = require('../src/services/campaignRepository.ts');
const { guideRepository } = require('../src/services/guideRepository.ts');
const { partnerRepository } = require('../src/services/partnerRepository.ts');
const { infoRepository } = require('../src/services/infoRepository.ts');
const { adoptionRepository } = require('../src/services/adoptionRepository.ts');
const { medicationRepository } = require('../src/services/medicationRepository.ts');
const { receiptRepository } = require('../src/services/adminReceiptRepository.ts');
const { adminOverviewRepository } = require('../src/services/adminOverviewRepository.ts');
const { adminPublicationRepository } = require('../src/services/adminPublicationRepository.ts');
const { buildStaticPixPayload } = require('../src/features/campaigns/pixPayload.ts');

async function verify() {
  const pixExample = buildStaticPixPayload('123e4567-e12b-12d1-a456-426655440000', 'Fulano de Tal', 'BRASILIA');
  assert(pixExample.endsWith('63041D3D'));
  assert(buildStaticPixPayload('pix@gatosdacorte.org.br').includes('pix@gatosdacorte.org.br'));
  assert.equal((await adminPublicationRepository.listForAdmin()).length, 4);
  assert.equal((await adminPublicationRepository.listPublished()).length, 3);
  assert.equal(await adminPublicationRepository.getPublished('exemplo-rascunho'), undefined);
  for (const kind of ['adoption', 'medication']) {
    const items = await receiptRepository.list(kind);
    assert.equal(items.filter((item) => item.source === 'demo').length, 4);
    assert.equal(items.filter((item) => item.source === 'example').length, 1);
    assert.deepEqual(items.filter((item) => item.source === 'demo').map((item) => item.status),
      ['pending', 'in_review', 'approved', 'rejected']);
    assert(items.filter((item) => item.source === 'demo').every((item) => item.sections.length > 0));
  }
  const baseline = await adminOverviewRepository.get();
  assert.equal(baseline.adoptionReceipts, 4);
  assert.equal(baseline.medicationReceipts, 4);
  assert.deepEqual(baseline.adoptionByStatus, { pending: 1, in_review: 1, approved: 1, rejected: 1 });
  assert.deepEqual(baseline.medicationByStatus, { pending: 1, in_review: 1, approved: 1, rejected: 1 });
  await assert.rejects(catRepository.remove('thor'), /CAT_HAS_ADOPTION_RECEIPTS/);

  const catDraft = { ...(await catRepository.getById('luna')), name: 'Teste CRUD', imageUrl: undefined };
  delete catDraft.id;
  const cat = await catRepository.create(catDraft);
  assert.equal((await catRepository.getById(cat.id)).name, 'Teste CRUD');
  await catRepository.update(cat.id, { ...catDraft, name: 'Teste editado' });
  assert.equal((await catRepository.getById(cat.id)).name, 'Teste editado');
  const photo = await catAdminRepository.addPhoto(cat.id, { url: 'https://example.com/a.jpg', altText: 'Foto A' });
  const secondPhoto = await catAdminRepository.addPhoto(cat.id, { url: 'https://example.com/b.jpg', altText: 'Foto B' });
  await catAdminRepository.updatePhoto(cat.id, secondPhoto.id, { url: 'https://example.com/c.jpg', altText: 'Foto C' });
  await catAdminRepository.setCover(cat.id, secondPhoto.id);
  assert.equal((await catRepository.getById(cat.id)).imageUrl, 'https://example.com/c.jpg');
  await catAdminRepository.removePhoto(cat.id, photo.id);
  await catAdminRepository.removePhoto(cat.id, secondPhoto.id);
  assert.equal((await catAdminRepository.listPhotos(cat.id)).length, 0);
  const recordDraft = { recordType: 'Consulta', title: 'Avaliação', notes: 'Registro fictício', occurredOn: '2026-10-17', nextDueOn: '' };
  const record = await catAdminRepository.addRecord(cat.id, recordDraft);
  await catAdminRepository.updateRecord(cat.id, record.id, { ...recordDraft, title: 'Retorno' });
  assert.equal((await catAdminRepository.listRecords(cat.id))[0].title, 'Retorno');
  await catAdminRepository.removeRecord(cat.id, record.id);
  await catRepository.remove(cat.id);
  assert.equal(await catRepository.getById(cat.id), undefined);

  const catWithPhoto = await catRepository.create({ ...catDraft, name: 'Foto local', imageUrl: 'file:///tmp/foto-gato.jpg' });
  const coverPhoto = (await catAdminRepository.listPhotos(catWithPhoto.id))[0];
  assert.equal(coverPhoto.url, 'file:///tmp/foto-gato.jpg');
  assert.equal(coverPhoto.isCover, true);
  assert.equal((await catRepository.getById(catWithPhoto.id)).imageUrl, coverPhoto.url);
  await catRepository.remove(catWithPhoto.id);

  const campaign = await campaignRepository.create({ title: 'Teste', description: 'Campanha fictícia', raisedCents: 100, goalCents: 1000 });
  assert.equal((await campaignRepository.getById(campaign.id)).title, 'Teste');
  await campaignRepository.update(campaign.id, { title: 'Teste editado', description: 'Campanha fictícia', raisedCents: 200, goalCents: 1000 });
  assert.equal((await campaignRepository.getById(campaign.id)).raisedCents, 200);
  await campaignRepository.remove(campaign.id);
  assert.equal(await campaignRepository.getById(campaign.id), undefined);

  const publication = await adminPublicationRepository.create({ title: 'Aviso teste', body: 'Texto fictício', status: 'draft' });
  assert.equal((await adminPublicationRepository.listForAdmin()).length, 5);
  assert.equal((await adminPublicationRepository.listPublished()).length, 3);
  assert.equal(await adminPublicationRepository.getPublished(publication.id), undefined);
  await adminPublicationRepository.update(publication.id, { title: 'Aviso editado', body: 'Texto público', status: 'published' });
  assert.equal((await adminPublicationRepository.getPublished(publication.id)).title, 'Aviso editado');
  await adminPublicationRepository.update(publication.id, { title: 'Aviso editado', body: 'Texto público', status: 'draft' });
  assert.equal((await adminPublicationRepository.listPublished()).length, 3);
  await adminPublicationRepository.remove(publication.id);
  assert.equal((await adminPublicationRepository.listForAdmin()).length, 4);

  const category = await guideRepository.createCategory('Categoria teste');
  const articleDraft = { categoryId: category.id, title: 'Artigo teste', summary: 'Resumo', body: 'Conteúdo fictício' };
  const article = await guideRepository.createArticle(articleDraft);
  assert.equal((await guideRepository.getArticleById(article.id)).title, 'Artigo teste');
  await assert.rejects(guideRepository.removeCategory(category.id), /CATEGORY_IN_USE_OR_NOT_FOUND/);
  await guideRepository.updateCategory(category.id, 'Categoria editada');
  await guideRepository.updateArticle(article.id, { ...articleDraft, title: 'Artigo editado' });
  assert.equal((await guideRepository.getArticleById(article.id)).title, 'Artigo editado');
  await guideRepository.removeArticle(article.id);
  await guideRepository.removeCategory(category.id);
  assert.equal(await guideRepository.getCategoryById(category.id), undefined);

  const partnerDraft = { name: 'Parceiro teste', category: 'veterinary', description: 'Descrição fictícia', socials: [] };
  const partner = await partnerRepository.create(partnerDraft);
  assert.equal((await partnerRepository.getById(partner.id)).name, 'Parceiro teste');
  await partnerRepository.update(partner.id, { ...partnerDraft, name: 'Parceiro editado' });
  assert.equal((await partnerRepository.getById(partner.id)).name, 'Parceiro editado');
  await partnerRepository.remove(partner.id);
  assert.equal(await partnerRepository.getById(partner.id), undefined);

  const about = await infoRepository.getById('about');
  await infoRepository.update('about', 'Texto de teste');
  assert.equal((await infoRepository.getById('about')).body, 'Texto de teste');
  await infoRepository.update('about', about.body);

  await receiptRepository.updateStatus('adoption', 'GDC-ADOC-DEMO-0001', 'in_review');
  assert.equal((await adminOverviewRepository.get()).adoptionByStatus.in_review, 2);
  const adoptionDemoProtocol = await receiptRepository.createDemo('adoption');
  const medicationDemoProtocol = await receiptRepository.createDemo('medication');
  assert((await receiptRepository.list('adoption')).some((item) => item.protocol === adoptionDemoProtocol && item.source === 'demo'));
  assert((await receiptRepository.list('medication')).some((item) => item.protocol === medicationDemoProtocol && item.source === 'demo'));

  const manualAdoption = await adoptionRepository.submit({ catId: 'luna', applicantName: 'Não guardar', applicantPhone: '000', consentPrivacy: true });
  const manualMedication = await medicationRepository.submit({ personName: 'Não guardar', attachments: [] });
  const adoptionItem = (await receiptRepository.list('adoption')).find((item) => item.protocol === manualAdoption.protocol);
  const medicationItem = (await receiptRepository.list('medication')).find((item) => item.protocol === manualMedication.protocol);
  assert.equal(adoptionItem.source, 'session');
  assert.equal(medicationItem.source, 'session');
  assert(!JSON.stringify(adoptionItem).includes('Não guardar'));
  assert(!JSON.stringify(medicationItem).includes('Não guardar'));

  console.log('CRUDs locais, publicações, protocolos fictícios, contagens, filtros por estado e privacidade dos envios manuais: OK');
}

verify().catch((error) => { console.error(error); process.exitCode = 1; });
