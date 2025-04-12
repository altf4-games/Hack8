using UnityEngine;

public class HighlightScript : MonoBehaviour
{
    private GameObject currentHighlightedObject;
    private Material originalMaterial;
    public Color highlightColor = Color.yellow;

    private void Update()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit))
        {
            if (hit.transform.tag != "Interactable")
                return;
            GameObject hitObject = hit.transform.gameObject;

            if (currentHighlightedObject != hitObject)
            {
                ResetHighlight();

                Renderer renderer = hitObject.GetComponent<Renderer>();
                if (renderer != null)
                {
                    originalMaterial = renderer.material;
                    Material highlightMaterial = new Material(originalMaterial);
                    highlightMaterial.EnableKeyword("_EMISSION");
                    highlightMaterial.SetColor("_EmissionColor", highlightColor);
                    renderer.material = highlightMaterial;

                    currentHighlightedObject = hitObject;
                }
            }
        }
        else
        {
            ResetHighlight();
        }
    }

    private void ResetHighlight()
    {
        if (currentHighlightedObject != null)
        {
            Renderer renderer = currentHighlightedObject.GetComponent<Renderer>();
            if (renderer != null && originalMaterial != null)
            {
                renderer.material = originalMaterial;
            }
            currentHighlightedObject = null;
            originalMaterial = null;
        }
    }
}